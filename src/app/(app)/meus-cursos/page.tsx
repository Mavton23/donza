import type { Metadata } from 'next';
import { MyCourses } from './my-courses';

export const metadata: Metadata = { title: 'Meus cursos' };
export default function Page() { return <MyCourses />; }
