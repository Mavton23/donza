import type { Metadata } from 'next';
import { NewCourse } from './new-course';

export const metadata: Metadata = { title: 'Novo curso' };
export default function Page() { return <NewCourse />; }
