package com.zjusthow.minicollections.cdk;

import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.RemovalPolicy;
import software.amazon.awscdk.SecretValue;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.Port;
import software.amazon.awscdk.services.ec2.SecurityGroup;
import software.amazon.awscdk.services.ec2.SubnetSelection;
import software.amazon.awscdk.services.ec2.SubnetType;
import software.amazon.awscdk.services.ec2.Vpc;
import software.amazon.awscdk.services.ecr.LifecycleRule;
import software.amazon.awscdk.services.ecr.Repository;
import software.amazon.awscdk.services.ecs.Cluster;
import software.amazon.awscdk.services.ecs.ContainerDefinitionOptions;
import software.amazon.awscdk.services.ecs.ContainerImage;
import software.amazon.awscdk.services.ecs.DeploymentCircuitBreaker;
import software.amazon.awscdk.services.ecs.FargateService;
import software.amazon.awscdk.services.ecs.FargateTaskDefinition;
import software.amazon.awscdk.services.ecs.LogDriver;
import software.amazon.awscdk.services.ecs.PortMapping;
import software.amazon.awscdk.services.ecs.Secret;
import software.amazon.awscdk.services.elasticloadbalancingv2.ApplicationLoadBalancer;
import software.amazon.awscdk.services.elasticloadbalancingv2.ApplicationProtocol;
import software.amazon.awscdk.services.elasticloadbalancingv2.ApplicationTargetGroup;
import software.amazon.awscdk.services.elasticloadbalancingv2.HealthCheck;
import software.amazon.awscdk.services.elasticloadbalancingv2.ListenerCertificate;
import software.amazon.awscdk.services.elasticloadbalancingv2.TargetType;
import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.OpenIdConnectProvider;
import software.amazon.awscdk.services.iam.PolicyStatement;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.ServicePrincipal;
import software.amazon.awscdk.services.iam.WebIdentityPrincipal;
import software.amazon.awscdk.services.logs.LogGroup;
import software.amazon.awscdk.services.logs.RetentionDays;
import software.amazon.awscdk.services.elasticloadbalancingv2.ListenerAction;
import software.amazon.awscdk.services.s3.BlockPublicAccess;
import software.amazon.awscdk.services.s3.Bucket;
import software.constructs.Construct;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MiniCollectionsStack extends Stack {

    public MiniCollectionsStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        String appName = contextString("appName", "minicollections");
        int desiredCount = Integer.parseInt(contextString("desiredCount", "0"));
        String databaseUrl = contextString("databaseUrl", "REPLACE_WITH_RDS_ENDPOINT");
        String redisHost = contextString("redisHost", "REPLACE_WITH_REDIS_ENDPOINT");
        String elasticsearchUris = contextString("elasticsearchUris", "REPLACE_WITH_OPENSEARCH_ENDPOINT");
        String s3BucketName = contextString("s3Bucket", "REPLACE_WITH_S3_BUCKET");
        String s3PublicBaseUrl = contextString("s3PublicBaseUrl", "REPLACE_WITH_PUBLIC_MEDIA_URL");
        String githubRepository = contextString("githubRepository", "");
        String certificateArn = contextString("certificateArn", "");
        boolean usePublicSubnets = contextBoolean("usePublicSubnets", true);

        Vpc vpc = Vpc.Builder.create(this, "Vpc")
                .maxAzs(2)
                .natGateways(usePublicSubnets ? 0 : 1)
                .build();

        Repository ecrRepository = Repository.Builder.create(this, "EcrRepository")
                .repositoryName(appName)
                .removalPolicy(RemovalPolicy.RETAIN)
                .lifecycleRules(List.of(
                        LifecycleRule.builder()
                                .maxImageCount(30)
                                .description("Keep recent deploy images")
                                .build()
                ))
                .build();

        LogGroup logGroup = LogGroup.Builder.create(this, "LogGroup")
                .logGroupName("/ecs/" + appName)
                .retention(RetentionDays.ONE_MONTH)
                .removalPolicy(RemovalPolicy.RETAIN)
                .build();

        software.amazon.awscdk.services.secretsmanager.Secret appSecret =
                software.amazon.awscdk.services.secretsmanager.Secret.Builder.create(this, "AppSecret")
                .secretName(appName + "/app")
                .description("MiniCollections runtime secrets for ECS tasks")
                .secretObjectValue(Map.of(
                        "JWT_SECRET", SecretValue.unsafePlainText("REPLACE_WITH_openssl_rand_base64_32"),
                        "DATABASE_PASSWORD", SecretValue.unsafePlainText("CHANGE_ME"),
                        "S3_ACCESS_KEY", SecretValue.unsafePlainText("OPTIONAL_IF_USING_TASK_ROLE"),
                        "S3_SECRET_KEY", SecretValue.unsafePlainText("OPTIONAL_IF_USING_TASK_ROLE")
                ))
                .build();

        Role executionRole = Role.Builder.create(this, "ExecutionRole")
                .roleName(appName + "-ecs-execution")
                .assumedBy(new ServicePrincipal("ecs-tasks.amazonaws.com"))
                .managedPolicies(List.of(
                        ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy")
                ))
                .build();
        appSecret.grantRead(executionRole);

        Role taskRole = Role.Builder.create(this, "TaskRole")
                .roleName(appName + "-ecs-task")
                .assumedBy(new ServicePrincipal("ecs-tasks.amazonaws.com"))
                .build();

        if (!s3BucketName.startsWith("REPLACE")) {
            Bucket mediaBucket = Bucket.Builder.create(this, "MediaBucket")
                    .bucketName(s3BucketName)
                    .blockPublicAccess(BlockPublicAccess.BLOCK_ALL)
                    .encryption(software.amazon.awscdk.services.s3.BucketEncryption.S3_MANAGED)
                    .removalPolicy(RemovalPolicy.RETAIN)
                    .build();
            mediaBucket.grantReadWrite(taskRole);
        }

        FargateTaskDefinition taskDefinition = FargateTaskDefinition.Builder.create(this, "TaskDefinition")
                .family(appName)
                .cpu(512)
                .memoryLimitMiB(1024)
                .executionRole(executionRole)
                .taskRole(taskRole)
                .build();

        taskDefinition.addContainer(appName, ContainerDefinitionOptions.builder()
                .image(ContainerImage.fromEcrRepository(ecrRepository, "latest"))
                .essential(true)
                .portMappings(List.of(
                        PortMapping.builder()
                                .containerPort(8080)
                                .protocol(software.amazon.awscdk.services.ecs.Protocol.TCP)
                                .build()
                ))
                .environment(containerEnvironment(
                        databaseUrl,
                        redisHost,
                        elasticsearchUris,
                        s3BucketName,
                        s3PublicBaseUrl
                ))
                .secrets(Map.of(
                        "JWT_SECRET", Secret.fromSecretsManager(appSecret, "JWT_SECRET"),
                        "DATABASE_PASSWORD", Secret.fromSecretsManager(appSecret, "DATABASE_PASSWORD"),
                        "S3_ACCESS_KEY", Secret.fromSecretsManager(appSecret, "S3_ACCESS_KEY"),
                        "S3_SECRET_KEY", Secret.fromSecretsManager(appSecret, "S3_SECRET_KEY")
                ))
                .logging(LogDriver.awsLogs(software.amazon.awscdk.services.ecs.AwsLogDriverProps.builder()
                        .logGroup(logGroup)
                        .streamPrefix("ecs")
                        .build()))
                .build());

        Cluster cluster = Cluster.Builder.create(this, "Cluster")
                .clusterName(appName)
                .vpc(vpc)
                .containerInsightsV2(software.amazon.awscdk.services.ecs.ContainerInsights.ENABLED)
                .build();

        SecurityGroup albSecurityGroup = SecurityGroup.Builder.create(this, "AlbSecurityGroup")
                .vpc(vpc)
                .allowAllOutbound(true)
                .description("Public ingress for MiniCollections ALB")
                .build();
        albSecurityGroup.addIngressRule(
                software.amazon.awscdk.services.ec2.Peer.anyIpv4(),
                Port.tcp(80),
                "Allow HTTP"
        );
        if (!certificateArn.isBlank()) {
            albSecurityGroup.addIngressRule(
                    software.amazon.awscdk.services.ec2.Peer.anyIpv4(),
                    Port.tcp(443),
                    "Allow HTTPS"
            );
        }

        SecurityGroup serviceSecurityGroup = SecurityGroup.Builder.create(this, "ServiceSecurityGroup")
                .vpc(vpc)
                .allowAllOutbound(true)
                .description("Ingress from ALB to ECS tasks")
                .build();
        serviceSecurityGroup.addIngressRule(albSecurityGroup, Port.tcp(8080), "ALB to application");

        ApplicationLoadBalancer loadBalancer = ApplicationLoadBalancer.Builder.create(this, "LoadBalancer")
                .loadBalancerName(appName)
                .vpc(vpc)
                .internetFacing(true)
                .securityGroup(albSecurityGroup)
                .vpcSubnets(SubnetSelection.builder()
                        .subnetType(SubnetType.PUBLIC)
                        .build())
                .build();

        ApplicationTargetGroup targetGroup = ApplicationTargetGroup.Builder.create(this, "TargetGroup")
                .targetGroupName(appName + "-tg")
                .vpc(vpc)
                .port(8080)
                .protocol(ApplicationProtocol.HTTP)
                .targetType(TargetType.IP)
                .healthCheck(HealthCheck.builder()
                        .path("/brands")
                        .healthyHttpCodes("200")
                        .interval(Duration.seconds(30))
                        .timeout(Duration.seconds(5))
                        .healthyThresholdCount(2)
                        .unhealthyThresholdCount(3)
                        .build())
                .deregistrationDelay(Duration.seconds(30))
                .build();

        if (!certificateArn.isBlank()) {
            loadBalancer.addListener("HttpsListener", software.amazon.awscdk.services.elasticloadbalancingv2.BaseApplicationListenerProps.builder()
                    .port(443)
                    .protocol(ApplicationProtocol.HTTPS)
                    .certificates(List.of(ListenerCertificate.fromArn(certificateArn)))
                    .open(true)
                    .defaultTargetGroups(List.of(targetGroup))
                    .build());
        }

        if (certificateArn.isBlank()) {
            loadBalancer.addListener("HttpListener", software.amazon.awscdk.services.elasticloadbalancingv2.BaseApplicationListenerProps.builder()
                    .port(80)
                    .protocol(ApplicationProtocol.HTTP)
                    .open(true)
                    .defaultTargetGroups(List.of(targetGroup))
                    .build());
        } else {
            loadBalancer.addListener("HttpRedirectListener", software.amazon.awscdk.services.elasticloadbalancingv2.BaseApplicationListenerProps.builder()
                    .port(80)
                    .protocol(ApplicationProtocol.HTTP)
                    .open(true)
                    .defaultAction(ListenerAction.redirect(software.amazon.awscdk.services.elasticloadbalancingv2.RedirectOptions.builder()
                            .protocol("HTTPS")
                            .port("443")
                            .permanent(true)
                            .build()))
                    .build());
        }

        SubnetType serviceSubnetType = usePublicSubnets
                ? SubnetType.PUBLIC
                : SubnetType.PRIVATE_WITH_EGRESS;

        FargateService service = FargateService.Builder.create(this, "Service")
                .serviceName(appName)
                .cluster(cluster)
                .taskDefinition(taskDefinition)
                .desiredCount(desiredCount)
                .assignPublicIp(usePublicSubnets)
                .securityGroups(List.of(serviceSecurityGroup))
                .vpcSubnets(SubnetSelection.builder()
                        .subnetType(serviceSubnetType)
                        .build())
                .healthCheckGracePeriod(Duration.seconds(120))
                .minHealthyPercent(0)
                .maxHealthyPercent(200)
                .circuitBreaker(DeploymentCircuitBreaker.builder()
                        .rollback(false)
                        .build())
                .build();
        service.attachToApplicationTargetGroup(targetGroup);

        Role githubDeployRole = null;
        if (!githubRepository.isBlank() && !githubRepository.startsWith("OWNER/")) {
            githubDeployRole = createGitHubDeployRole(
                    appName,
                    githubRepository,
                    ecrRepository,
                    executionRole,
                    taskRole
            );
        }

        emitOutputs(
                appName,
                usePublicSubnets,
                loadBalancer,
                ecrRepository,
                executionRole,
                taskRole,
                appSecret,
                githubDeployRole
        );
    }

    private Role createGitHubDeployRole(
            String appName,
            String githubRepository,
            Repository ecrRepository,
            Role executionRole,
            Role taskRole
    ) {
        OpenIdConnectProvider githubOidcProvider = OpenIdConnectProvider.Builder.create(this, "GitHubOidcProvider")
                .url("https://token.actions.githubusercontent.com")
                .clientIds(List.of("sts.amazonaws.com"))
                .thumbprints(List.of(
                        "6938fd4d98bab03faadb97b34396831e3780aea1",
                        "1c58a3a8518e8779b8b4d5940d393af2afb246e6"
                ))
                .build();

        Role deployRole = Role.Builder.create(this, "GitHubDeployRole")
                .roleName(appName + "-github-deploy")
                .assumedBy(new WebIdentityPrincipal(
                        githubOidcProvider.getOpenIdConnectProviderArn(),
                        Map.of(
                                "StringEquals", Map.of(
                                        "token.actions.githubusercontent.com:aud", "sts.amazonaws.com"
                                ),
                                "StringLike", Map.of(
                                        "token.actions.githubusercontent.com:sub",
                                        "repo:" + githubRepository + ":ref:refs/heads/main"
                                )
                        )
                ))
                .description("GitHub Actions deploy role for MiniCollections")
                .build();

        ecrRepository.grantPullPush(deployRole);
        deployRole.addToPolicy(PolicyStatement.Builder.create()
                .actions(List.of(
                        "ecs:DescribeServices",
                        "ecs:DescribeTaskDefinition",
                        "ecs:DescribeTasks",
                        "ecs:ListTasks",
                        "ecs:RegisterTaskDefinition",
                        "ecs:UpdateService"
                ))
                .resources(List.of("*"))
                .build());
        deployRole.addToPolicy(PolicyStatement.Builder.create()
                .actions(List.of("iam:PassRole"))
                .resources(List.of(executionRole.getRoleArn(), taskRole.getRoleArn()))
                .build());

        return deployRole;
    }

    private void emitOutputs(
            String appName,
            boolean usePublicSubnets,
            ApplicationLoadBalancer loadBalancer,
            Repository ecrRepository,
            Role executionRole,
            Role taskRole,
            software.amazon.awscdk.services.secretsmanager.Secret appSecret,
            Role githubDeployRole
    ) {
        CfnOutput.Builder.create(this, "NetworkMode")
                .value(usePublicSubnets
                        ? "public-subnets-with-public-ip (no NAT Gateway)"
                        : "private-subnets-with-nat-gateway")
                .description("ECS networking mode controlled by usePublicSubnets context")
                .build();

        CfnOutput.Builder.create(this, "AlbDnsName")
                .value(loadBalancer.getLoadBalancerDnsName())
                .description("ALB DNS name — point your domain CNAME here")
                .build();

        CfnOutput.Builder.create(this, "EcrRepositoryUri")
                .value(ecrRepository.getRepositoryUri())
                .description("ECR repository URI")
                .build();

        CfnOutput.Builder.create(this, "EcsClusterName")
                .value(appName)
                .description("ECS cluster name for GitHub Actions variable ECS_CLUSTER")
                .build();

        CfnOutput.Builder.create(this, "EcsServiceName")
                .value(appName)
                .description("ECS service name for GitHub Actions variable ECS_SERVICE")
                .build();

        CfnOutput.Builder.create(this, "EcsExecutionRoleArn")
                .value(executionRole.getRoleArn())
                .description("GitHub Actions variable ECS_EXECUTION_ROLE_ARN")
                .build();

        CfnOutput.Builder.create(this, "EcsTaskRoleArn")
                .value(taskRole.getRoleArn())
                .description("GitHub Actions variable ECS_TASK_ROLE_ARN")
                .build();

        CfnOutput.Builder.create(this, "AppSecretsArn")
                .value(appSecret.getSecretArn())
                .description("GitHub Actions variable APP_SECRETS_ARN")
                .build();

        if (githubDeployRole != null) {
            CfnOutput.Builder.create(this, "GitHubDeployRoleArn")
                    .value(githubDeployRole.getRoleArn())
                    .description("GitHub Actions variable AWS_ROLE_ARN (OIDC)")
                    .build();
        }

        CfnOutput.Builder.create(this, "NextSteps")
                .value(
                        "1) Update Secrets Manager values  2) Push to main (GitHub Actions)  "
                                + "3) aws ecs update-service --cluster " + appName
                                + " --service " + appName + " --desired-count 1"
                )
                .description("Post-deploy checklist")
                .build();
    }

    private Map<String, String> containerEnvironment(
            String databaseUrl,
            String redisHost,
            String elasticsearchUris,
            String s3BucketName,
            String s3PublicBaseUrl
    ) {
        Map<String, String> environment = new HashMap<>();
        environment.put("SPRING_PROFILES_ACTIVE", "prod");
        environment.put("PORT", "8080");
        environment.put("INIT_DB", "never");
        environment.put("DATABASE_URL", databaseUrl);
        environment.put("DATABASE_PORT", "5432");
        environment.put("DATABASE_USERNAME", "postgres");
        environment.put("REDIS_HOST", redisHost);
        environment.put("REDIS_PORT", "6379");
        environment.put("ELASTICSEARCH_URIS", elasticsearchUris);
        environment.put("ELASTICSEARCH_ENABLED", "true");
        environment.put("ELASTICSEARCH_REINDEX_ON_STARTUP", "false");
        environment.put("S3_ENABLED", "true");
        environment.put("S3_ENDPOINT", "https://s3.amazonaws.com");
        environment.put("S3_REGION", Stack.of(this).getRegion());
        environment.put("S3_BUCKET", s3BucketName);
        environment.put("S3_PUBLIC_BASE_URL", s3PublicBaseUrl);
        return environment;
    }

    private String contextString(String key, String defaultValue) {
        Object value = this.getNode().tryGetContext(key);
        if (value == null) {
            return defaultValue;
        }
        String text = value.toString();
        return text.isBlank() ? defaultValue : text;
    }

    private boolean contextBoolean(String key, boolean defaultValue) {
        Object value = this.getNode().tryGetContext(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }
        String text = value.toString().trim();
        if (text.isBlank()) {
            return defaultValue;
        }
        return Boolean.parseBoolean(text);
    }
}
