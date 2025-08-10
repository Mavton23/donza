import { Tab } from '@headlessui/react';
import CourseCard from '@/components/courses/CourseCard';
import EventCard from '@/components/events/EventCard';
import EmptyState from '@/components/common/EmptyState';

export default function ActivitiesTab({ user, isOwnProfile }) {
  // Dados agrupados
  const activities = {
    teaching: user.taughtCourses || [],
    learning: user.enrolledCourses || [],
    events: [...(user.organizedEvents || []), ...(user.eventsAttended || [])]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1 mb-6">
          {['Ensinando', 'Aprendendo', 'Eventos'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                  selected
                    ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Cursos que ensina */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.teaching.length > 0 ? (
                activities.teaching.map(course => (
                  <CourseCard 
                    key={course.courseId}
                    course={course}
                    variant="instructor"
                  />
                ))
              ) : (
                <EmptyState
                  title={isOwnProfile ? "Você ainda não criou cursos" : "Nenhum curso ministrado"}
                  description={isOwnProfile ? "Compartilhe seu conhecimento criando seu primeiro curso" : "Este usuário ainda não ministrou cursos"}
                  actionText={isOwnProfile ? "Criar curso" : null}
                  actionLink={isOwnProfile ? "/instructor/courses/new" : null}
                />
              )}
            </div>
          </Tab.Panel>

          {/* Cursos matriculados */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.learning.length > 0 ? (
                activities.learning.map(course => (
                  <CourseCard 
                    key={course.courseId}
                    course={course}
                    variant="student"
                    progress={course.enrollment?.progress}
                  />
                ))
              ) : (
                <EmptyState
                  title={isOwnProfile ? "Você ainda não se matriculou" : "Nenhuma matrícula"}
                  description={isOwnProfile ? "Explore nossos cursos para começar a aprender" : "Este usuário ainda não se matriculou em cursos"}
                  actionText={isOwnProfile ? "Explorar cursos" : null}
                  actionLink={isOwnProfile ? "/courses" : null}
                />
              )}
            </div>
          </Tab.Panel>

          {/* Eventos */}
          <Tab.Panel>
            <div className="space-y-4">
              {activities.events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.events.map(event => (
                    <EventCard 
                      key={event.eventId}
                      event={event}
                      variant={event.organizerId === user.userId ? 'organizer' : 'participant'}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={isOwnProfile ? "Nenhum evento encontrado" : "Nenhuma participação"}
                  description={isOwnProfile ? "Participe de eventos para expandir sua rede" : "Este usuário ainda não participou de eventos"}
                  actionText={isOwnProfile ? "Explorar eventos" : null}
                  actionLink={isOwnProfile ? "/events" : null}
                />
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}