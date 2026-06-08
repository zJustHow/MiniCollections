import "../styles/profile.css";

function ProfileSectionSkeleton({ fieldCount = 1 }) {
  return (
    <div className="profile-section-card neu-profile-section-skeleton">
      <span className="neu-card-skeleton-line neu-profile-skeleton-label" />
      {Array.from({ length: fieldCount }, (_, index) => (
        <span
          key={index}
          className="neu-card-skeleton-line neu-profile-skeleton-field"
        />
      ))}
      <span className="neu-card-skeleton-line neu-profile-skeleton-button" />
    </div>
  );
}

export default function ProfilePageSkeleton() {
  return (
    <div className="profile-page-content neu-profile-page-skeleton" aria-busy="true">
      <div className="profile-page-inner">
        <div className="profile-hero neu-profile-skeleton-hero">
          <span className="neu-profile-skeleton-avatar" aria-hidden="true">
            <span className="neu-card-skeleton-line neu-profile-skeleton-avatar-fill" />
          </span>
          <span className="neu-card-skeleton-line neu-profile-skeleton-name" />
          <span className="neu-card-skeleton-line neu-profile-skeleton-email" />
        </div>
        <div className="neu-profile-skeleton-divider" aria-hidden="true" />
        <ProfileSectionSkeleton fieldCount={1} />
        <ProfileSectionSkeleton fieldCount={3} />
        <ProfileSectionSkeleton fieldCount={2} />
        <ProfileSectionSkeleton fieldCount={1} />
      </div>
    </div>
  );
}
