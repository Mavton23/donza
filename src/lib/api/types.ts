export type Role = 'student' | 'instructor' | 'institution' | 'admin';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'audio' | 'pdf' | 'text' | 'quiz' | 'assignment';

export interface User {
  userId: string; username: string; email: string; role: Role;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | string;
  fullName: string | null; institutionName?: string | null; avatarUrl: string | null; bio: string | null;
  interests: string[]; expertise: string[]; isPrivate: boolean; profileCompleted: boolean; isVerified: boolean;
  educationLevel?: string | null; educationField?: string | null; socialMedia?: Record<string, string>;
  createdAt: string;
}

export interface PersonCard { userId: string; username: string; name: string; avatarUrl: string | null; role: Role; bio?: string | null; institutionName?: string | null }

export interface Instructor { userId: string; username: string; fullName: string | null; institutionName: string | null; avatarUrl: string | null; role: Role; bio?: string | null }

export interface Course {
  courseId: string; slug: string; title: string; shortDescription: string | null; description: string | null;
  category: string | null; level: Level; coverImageUrl: string | null; duration: number | null; language: string;
  price: string; currency: string; requirements: string[]; learningOutcomes: string[];
  ratingAverage: string; ratingCount: number; status: string; createdAt: string;
  instructor: Instructor; organizer?: Instructor | null;
  enrollmentsCount?: number;
  metrics?: { lessonsCount?: number; modulesCount?: number; enrollments?: number };
}

export interface Lesson {
  lessonId: string; moduleId: string; title: string; order: number; lessonType: LessonType; duration: number | null;
  isFree: boolean; price: string; locked?: boolean;
  content?: string | null; mediaUrl?: string | null; externalResources?: string[];
}
export interface CourseModule { moduleId: string; title: string; description: string | null; order: number; lessons: Lesson[] }
export interface CourseDetail extends Course {
  modules: CourseModule[];
  viewer?: { isEnrolled: boolean; isOwner?: boolean; canManage?: boolean; progress?: number } | null;
}

export interface Enrollment {
  enrollmentId: string; courseId: string; progress: number; status: string; enrolledAt: string;
  lastAccessed: string | null; favorite: boolean; completedAt: string | null; course?: Course;
}
export interface Progress { courseId: string; progress: number; completedLessons: number; totalLessons: number; completedLessonIds: string[]; enrollment: Enrollment }

export interface Notification {
  notificationId: string; type: string; title: string; message: string; isRead: boolean; createdAt: string; relatedEntityId?: string | null;
}

export interface FollowStatus { isFollowing: boolean; hasRequested: boolean; followsYou: boolean; followersCount: number; followingCount: number }
export interface Profile extends PersonCard {
  isPrivate?: boolean; followersCount: number; followingCount: number;
  viewer: { isSelf: boolean; isFollowing: boolean; hasRequested: boolean; followsYou: boolean };
  interests?: string[]; expertise?: string[]; memberSince?: string; coursesCount?: number; studentsCount?: number;
  rating?: { average: number; count: number }; teachingExperience?: string | null;
}

export interface PublicStats { students: number; instructors: number; institutions: number; courses: number; completedCourses: number; certificatesIssued: number }

export interface AuthResponse { user: User; accessToken: string }

export type PublicationStatus = 'draft' | 'published' | 'archived';
export interface ManagedLesson extends Lesson { isPublished: boolean; level?: Level }
export interface ManagedModule extends Omit<CourseModule, 'lessons'> { isPublished: boolean; lessons: ManagedLesson[] }
export interface ManagedCourse extends Omit<CourseDetail, 'modules' | 'status'> { status: PublicationStatus; isPublic: boolean; modules: ManagedModule[] }
export interface SignedUpload { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string; resourceType: 'video' | 'raw' | 'image'; allowedFormats: string | null; uploadUrl: string }

export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'late';
export interface Submission {
  submissionId: string; assignmentId: string; userId: string; content: string | null; attachmentUrl: string | null;
  grade: number | null; gradePercentage: number | null; feedback: string | null; status: SubmissionStatus; isLate: boolean; submittedAt: string; updatedAt: string;
  student?: { userId: string; username: string; fullName: string | null; avatarUrl: string | null };
}
export interface StudentAssignment {
  assignmentId: string; title: string; description: string; dueDate: string | null; maxScore: number; status: 'published' | 'closed';
  allowLateSubmissions: boolean; latePenalty: number; submissionFormat: 'text' | 'file' | 'both'; allowedFileTypes: string[];
  submission: Submission | null; state: 'pending' | 'overdue' | SubmissionStatus; canSubmit: boolean;
}
export interface ManagedAssignment {
  assignmentId: string; courseId: string; title: string; description: string; dueDate: string | null; maxScore: number;
  status: 'draft' | 'published' | 'closed'; allowLateSubmissions: boolean; latePenalty: number; submissionFormat: 'text' | 'file' | 'both'; allowedFileTypes: string[];
  course?: { courseId: string; title: string }; submissionsCount?: number; gradedCount?: number;
}
export interface Certificate {
  certificateId: string; credentialId: string; issueDate: string; expirationDate: string | null; hours: number; status: 'issued' | 'revoked' | 'expired';
  course: { courseId: string; title: string; slug: string } | null; event: { eventId: string; title: string } | null;
}

export type MembershipType = 'open' | 'approval' | 'invite_only';
export type PostType = 'discussion' | 'question' | 'resource' | 'announcement' | 'assignment';
export type ReactionType = 'like' | 'helpful' | 'creative' | 'confused' | 'celebrate' | 'insightful';
export interface Community {
  communityId: string; name: string; slug: string; description: string | null; shortDescription: string | null; isPublic: boolean;
  coverImage: string | null; thumbnailImage: string | null; tags: string[]; membershipType: MembershipType; status: string; createdAt: string;
  creator: { userId: string; username: string; avatarUrl: string | null };
  stats: { members: number; posts: number; studyGroups: number };
  viewer?: { isMember: boolean; role: string | null; status: string | null } | null;
}
export interface PostAuthor { userId: string; username: string; avatarUrl: string | null; fullName?: string | null }
export interface PostStats { reactions: Record<ReactionType, number>; reactionsTotal: number; viewCount: number; commentCount: number }
export interface Post {
  postId: string; communityId: string; authorId: string; title: string; excerpt: string | null; content?: string; isPinned: boolean; isLocked: boolean;
  postType: PostType; status: string; createdAt: string; author: PostAuthor; tags: string[]; stats: PostStats; acceptedAnswerId: string | null;
  myReaction?: ReactionType | null; viewer?: { reaction: ReactionType | null; canEdit: boolean; canModerate: boolean; canComment: boolean };
}
export interface PostComment {
  commentId: string; postId: string; parentCommentId: string | null; content: string; isAnswer: boolean; createdAt: string; author: PostAuthor;
  replies?: PostComment[]; repliesCount?: number;
}

export type GroupPrivacy = 'public' | 'private' | 'invite_only';
export interface StudyGroup {
  groupId: string; name: string; description: string | null; goals: string | null; privacy: GroupPrivacy; approvalRequired: boolean; maxMembers: number;
  tags: string[]; status: string; coverImageUrl: string | null; membersCount: number; spotsLeft?: number; createdAt: string;
  creator: { userId: string; username: string; avatarUrl: string | null };
  community: { communityId: string; name: string; slug: string } | null;
  viewer?: { isMember: boolean; role: string | null; status?: string | null; hasPendingRequest?: boolean; hasInvite?: boolean; canManage?: boolean; canModerate?: boolean; isCreator?: boolean };
  inviteCode?: string;
}
export interface GroupMember { userId: string; username: string; avatarUrl: string | null; role: string; status: string; contributionScore: number; joinedAt: string }
export interface LeaderboardEntry { rank: number; userId: string; username: string; avatarUrl: string | null; role: string; points: number; level: number }
export interface GroupMeeting { meetingId: string; title: string; description: string | null; startTime: string; endTime: string | null; meetingUrl: string | null; status: string; organizer: { userId: string; username: string }; confirmedCount: number; myRsvp: 'confirmed' | 'declined' | null }
export type TaskPriority = 'low' | 'medium' | 'high';
export type GroupTaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export interface GroupTask {
  taskId: string; title: string; description: string | null; deadline: string | null; status: GroupTaskStatus; priority: TaskPriority; overdue: boolean;
  creator: { userId: string; username: string }; assignees: { userId: string; username: string; status?: string }[]; progress: { done: number; total: number };
  myAssignment: 'pending' | 'completed' | 'rejected' | null;
}
export interface GroupTopic { topicId: string; title: string; content?: string; isPinned: boolean; isClosed: boolean; tags: string[]; createdAt: string; author: { userId: string; username: string; avatarUrl: string | null }; excerpt?: string; repliesCount: number; solved: boolean; solutionReplyId?: string | null }
export interface TopicReply { replyId: string; content: string; upvotes: number; isSolution: boolean; createdAt: string; author: { userId: string; username: string; avatarUrl: string | null }; myVote: 'up' | 'down' | null }

export interface ChatMessage {
  messageId: string; senderId: string; content: string | null; type: string; status: string; edited: boolean; createdAt: string; replyToId: string | null;
  sender: { userId: string; username: string; avatarUrl: string | null }; readByOther?: boolean; metadata?: { subject?: string; attachment?: { url: string; name?: string } } & Record<string, unknown>;
  replyTo?: { messageId: string; content: string | null; sender?: { username: string } } | null;
}
export interface Conversation {
  conversationId: string; participant: { userId: string; username: string; avatarUrl: string | null; role: string };
  lastMessage: ChatMessage | null; unreadCount: number; muted: boolean;
}
export interface MessageRequest {
  requestId: string; subject: string; message: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string;
  sender: { userId: string; username: string; avatarUrl: string | null; role: string }; receiver: { userId: string; username: string; avatarUrl: string | null; role: string };
}

export type EventStatus = 'scheduled' | 'live' | 'completed' | 'canceled';
export interface DonzaEvent {
  eventId: string; organizerId: string; title: string; description: string | null; startDate: string; endDate: string | null; location: string | null;
  isOnline: boolean; maxParticipants: number | null; price: string; status: EventStatus; participantsCount: number; spotsLeft: number | null;
  meetingUrl?: string | null; meetingUrlLocked?: boolean;
  organizer: { userId: string; username: string; name: string; avatarUrl: string | null; bio?: string | null };
  viewer?: { isRegistered: boolean; registration: { attended?: boolean } | null; canManage: boolean };
}
export interface EventParticipant { registrationId: string; userId: string; status: string; attended: boolean; user: { userId: string; username: string; fullName: string | null; avatarUrl: string | null } }
export interface CalendarItem { kind: 'event' | 'assignment' | 'task'; uid: string; start: string; end?: string; summary: string; description?: string; location?: string; url?: string }

export interface Review {
  reviewId: string; entityType: 'course' | 'event' | 'instructor'; rating: number; comment: string | null; instructorReply: string | null; replyDate: string | null; createdAt: string; updatedAt: string;
  user: { userId: string; username: string; fullName: string | null; avatarUrl: string | null };
  course?: { courseId: string; title: string; slug: string } | null; event?: { eventId: string; title: string } | null;
}
export interface ReviewSummary { count: number; average: number; distribution: Record<'1' | '2' | '3' | '4' | '5', number> }
export interface ReviewEligibility { canReview: boolean; reason: string | null; reviewId?: string }

export interface AdminUser {
  userId: string; username: string; email: string; role: Role; status: string; fullName: string | null; institutionName: string | null; avatarUrl: string | null;
  isVerified: boolean; profileCompleted: boolean; lastLogin: string | null; createdAt: string; reviewDate: string | null; rejectionReason: string | null;
  bio?: string | null; counts?: { taughtCourses: number; enrollments: number; certificates: number; documents: number };
}
export interface UserDocument { docId: string; documentType: string; originalName: string; mimeType: string; size: number; status: 'pending' | 'approved' | 'rejected'; reviewDate: string | null; rejectionReason: string | null; createdAt: string }

export interface HelpCategory { id: string; name: string; description: string | null; icon: string | null; displayOrder: number; articleCount?: number; isActive?: boolean }
export interface HelpArticle { articleId: string; title: string; slug: string; category: string; excerpt: string | null; status: 'draft' | 'published' | 'archived'; viewCount: number; feedbackCount: number; helpfulCount: number; rating: number; updatedAt: string; createdAt: string; content?: string }
export interface Testimonial { testimonialId: string; content: string; rating: number; featured: boolean; createdAt: string; author: { name: string; role?: string | null; avatarUrl: string | null } }
export interface MyTestimonial extends Testimonial { status: 'pending' | 'approved' | 'rejected' }
export interface ContactRequest { requestId: string; name: string; email: string; contactMethod: 'email' | 'chat' | 'callback'; subject: string | null; message: string | null; phone: string | null; preferredTime: string | null; status: 'pending' | 'in_progress' | 'resolved'; createdAt: string }

export type CommunityBaseRole = 'admin' | 'moderator' | 'member';
export interface CommunityMemberRow { userId: string; username: string; fullName: string | null; avatarUrl: string | null; role: CommunityBaseRole; status: 'active' | 'muted' | 'banned' | 'pending'; joinedAt: string; roles: { roleId: string; name: string }[] }
export interface CommunityPermissions { managePosts?: boolean; manageEvents?: boolean; inviteMembers?: boolean; removeMembers?: boolean; editCommunity?: boolean }
export interface CommunityRole { roleId: string; name: string; permissions: CommunityPermissions; membersCount: number }
export interface CommunityInvite { inviteId: string; email: string; expiresAt: string; createdAt: string; inviter: { username: string } }

export type GroupMemberStatus = 'active' | 'muted' | 'banned';
export interface GroupMemberRow { membershipId: string; userId: string; username: string; avatarUrl: string | null; role: 'leader' | 'co-leader' | 'moderator' | 'member'; status: GroupMemberStatus; mutedUntil: string | null; joinedAt: string; contributionScore: number }
export interface GroupJoinRequest { requestId: string; message: string | null; requestedAt: string; userId: string; username: string; fullName: string | null; avatarUrl: string | null }
export interface GroupInviteRow { requestId: string; requestedAt: string; userId: string; username: string; avatarUrl: string | null; invitedBy: { userId: string; username: string } | null }
export type ModActionType = 'warn' | 'mute' | 'unmute' | 'ban' | 'unban' | 'remove_content';
interface ModPerson { userId: string; username: string; avatarUrl?: string | null }
export interface ModAction { actionId: string; type: ModActionType; reason: string; durationMinutes: number | null; expiresAt: string | null; revokedAt: string | null; createdAt: string; target: ModPerson; moderator: ModPerson }
export interface ModDashboard { pending: { reports: number; scans: number; appeals: number }; inForce: { mutes: number; bans: number }; last30Days: Record<string, number>; mostSanctioned: { user: ModPerson; actions: number }[]; recent: ModAction[] }
export interface MyModAction { actionId: string; type: ModActionType; reason: string; durationMinutes: number | null; expiresAt: string | null; revokedAt: string | null; createdAt: string; inForce: boolean; appealable: boolean; appeal: { appealId: string; status: string; decisionNote: string | null } | null }
export interface ContentScan { scanId: string; contentType: 'post' | 'comment' | 'resource' | 'profile'; riskScore: number; flaggedCategories: string[]; status: 'pending' | 'reviewed' | 'actioned' | 'falsePositive'; createdAt: string; details: { excerpt?: string; title?: string } | null; author: ModPerson | null }
export interface GroupAppeal { appealId: string; message: string; status: 'pending' | 'accepted' | 'rejected'; decisionNote: string | null; createdAt: string; user: ModPerson; action: { actionId: string; type: ModActionType; reason: string; createdAt: string; moderator: ModPerson } }
export interface TopicReport { reportId: string; reason: string; createdAt: string; reporter: ModPerson; topic: { topicId: string; title: string; authorId: string } | null }

export type GroupContentType = 'pdf' | 'video' | 'code' | 'link' | 'slide' | 'image';
export interface GroupContent { contentId: string; title: string; description: string | null; fileType: GroupContentType; fileUrl: string | null; externalUrl: string | null; downloadCount: number; createdAt: string; uploader: { userId: string; username: string; avatarUrl: string | null } }
export interface GroupAchievementInfo { type: string; label: string; points: number; description: string }
export interface MemberAchievements { member: { membershipId: string; points: number; userId: string; username: string; avatarUrl: string | null }; achievements: (GroupAchievementInfo & { achievementId: string; createdAt: string })[]; available: GroupAchievementInfo[] }
export interface GroupReportPerson { userId: string; username: string; avatarUrl?: string | null }
export interface ActivityReportData { period: { start: string; end: string }; members: { total: number; joined: number; left: number; active: number; engagementRate: number }; discussions: { topics: number; replies: number }; contents: { shared: number }; tasks: { created: number; completed: number }; meetings: { held: number; completed: number }; totalActions: number; topContributors: (GroupReportPerson & { actions: number })[]; inactiveMembers: (GroupReportPerson & { lastActiveAt: string | null })[]; dailyActivity: { date: string; activeUsers: number; actions: number }[] }
export interface TaskReportData { period: { start: string; end: string }; totals: { tasks: number; completed: number; open: number; overdue: number; completedInPeriod: number; completionRate: number }; byStatus: Record<string, number>; byPriority: Record<string, number>; overdueTasks: { taskId: string; title: string; deadline: string; priority: string }[]; upcomingDeadlines: { taskId: string; title: string; deadline: string; priority: string }[]; members: (GroupReportPerson & { assigned: number; completed: number; overdue: number; completionRate: number })[] }
export interface GroupReportRow<T = unknown> { reportId: string; type: 'WEEKLY_ACTIVITY' | 'MONTHLY_SUMMARY' | 'TASK_COMPLETION' | 'TOP_CONTRIBUTORS'; periodStart: string; periodEnd: string; updatedAt: string; data?: T }
