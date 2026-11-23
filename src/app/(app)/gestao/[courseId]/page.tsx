import { CourseEditor } from './course-editor';

export const metadata = { title: 'Gerir curso' };

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CourseEditor courseId={courseId} />;
}
