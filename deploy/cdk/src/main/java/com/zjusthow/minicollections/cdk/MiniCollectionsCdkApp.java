package com.zjusthow.minicollections.cdk;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Environment;
import software.amazon.awscdk.StackProps;

public final class MiniCollectionsCdkApp {

    private MiniCollectionsCdkApp() {
    }

    public static void main(final String[] args) {
        App app = new App();

        String account = System.getenv("CDK_DEFAULT_ACCOUNT");
        String region = System.getenv("CDK_DEFAULT_REGION");
        if (region == null || region.isBlank()) {
            region = "us-east-1";
        }

        Environment env = Environment.builder()
                .account(account)
                .region(region)
                .build();

        new MiniCollectionsStack(app, "MiniCollectionsStack", StackProps.builder()
                .env(env)
                .description("MiniCollections ECS Fargate service behind an ALB")
                .build());

        app.synth();
    }
}
