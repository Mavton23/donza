import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/common/Footer";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import api from "@/services/api";
import axios from "axios";
import StatCard from "@/components/cards/StatCard";
import EventCard from "@/components/events/EventCard";
import CourseCard from "@/components/cards/CourseCard";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import TestimonialFormModal from "@/components/testimonials/TestimonialFormModal";
import EmptyState from "@/components/common/EmptyState";
import ThemeToggle from "@/components/common/ThemeToggle";
import PlatformLoader from "@/components/common/PlatformLoader";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { MessageSquarePlus } from "lucide-react";


export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    institutions: 0
  });
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { show } = useNotification();
  const BackendUrl = import.meta.env.VITE_BACKEND_API_BASE_URL || "https://donza-api.onrender.com/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, eventsRes, statsRes, testiRes] = await Promise.all([
          axios.get(`${BackendUrl}/courses?limit=4`),
          axios.get(`${BackendUrl}/events?limit=3`),
          axios.get(`${BackendUrl}/users/stats`),
          axios.get(`${BackendUrl}/testimonial`, {
            params: {
              status: 'approved',
              featured: true,
              limit: 3
            }
          })
        ]);
        
        setCourses(coursesRes.data.data);
        setEvents(eventsRes.data.data);
        setStats(statsRes.data);
        setTestimonials(testiRes.data.data);
      } catch (error) {
        show("error", error instanceof Error ? error.message : error);
        setError(error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
        setLoadingTestimonials(false);
      }
    };

    fetchData();
  }, []);

  // Função para adicionar um novo testemunho
  const handleAddTestimonial = async (formData) => {
  try {
    await api.post('/testimonial', formData);
    setIsFormOpen(false);
    show('success', 'Depoimento criado com sucesso! Ele será revisado antes de ser publicado. Obrigado');
  } catch (error) {
    throw error;
  }
};

  if (loading) return <PlatformLoader fullScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white py-24 md:py-32">
        {/* Botão de Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        {/* Partículas animadas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 10 : 20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: 0.3
              }}
              animate={{
                x: [null, Math.random() * 100],
                y: [null, Math.random() * 100],
                transition: {
                  duration: 10 + Math.random() * 20,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
              className="absolute rounded-full bg-white"
              style={{
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                opacity: 0.1 + Math.random() * 0.2
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Transforme seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">conhecimento</span> em experiências
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-10 text-indigo-100 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              A plataforma educacional mais completa para quem quer aprender ou ensinar de forma moderna e interativa
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-custom-primary text-white font-semibold rounded-full hover:bg-custom-primary-hover transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Acessar Plataforma
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup?as=student"
                    className="px-8 py-4 bg-custom-primary text-white font-semibold rounded-full hover:bg-custom-primary-hover transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Começar a aprender
                  </Link>
                  <Link
                    to="/signup?as=instructor"
                    className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-custom-primary transition-all transform hover:scale-105"
                  >
                    Ensinar na plataforma
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Ondas decorativas na parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="fill-current text-indigo-800 dark:text-gray-900"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="fill-current text-indigo-800 dark:text-gray-900"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-current text-indigo-800 dark:text-gray-900"
            ></path>
          </svg>
        </div>
      </section>

      {/* Stats Section - Animações em cascata */}
      <section className="py-16 bg-white dark:bg-gray-800 relative z-10 -mt-1">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard value={stats.students} label="Estudantes Ativos" delay={0.1} />
            <StatCard value={stats.courses} label="Cursos Disponíveis" delay={0.3} />
            <StatCard value={stats.institutions} label="Instituições de ensino" delay={0.5} />
            <StatCard value={stats.instructors} label="Instrutores Especialistas" delay={0.5} />
          </div>
        </div>
      </section>

      {/* Featured Courses - Layout moderno */}
      <section className="py-20 relative">
        <div className="absolute inset-0 -z-10 opacity-10 bg-[url('/pattern-grid.svg')]"></div>
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cursos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Destaque</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Aprenda com os melhores instrutores e alcance seus objetivos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course, index) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Explorar Todos os Cursos
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Design moderno */}
      <section className="py-20 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Por que escolher nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">plataforma</span>?
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Uma experiência de aprendizado completa e personalizada
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-md">
                <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Conteúdo Premium</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Cursos criados e revisados por especialistas em suas áreas com a mais alta qualidade
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-md">
                <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Eventos Exclusivos</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Workshops, webinars e encontros com profissionais renomados da indústria
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-md">
                <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Certificação Reconhecida</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Certificados válidos que agregam valor real ao seu currículo e carreira
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events - Design moderno */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Próximos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Eventos</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Participe de experiências educacionais enriquecedoras
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/events"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Ver Todos os Eventos
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Seção de Testemunhos */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              O que nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">alunos</span> dizem
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Depoimentos de quem já transformou sua carreira
            </p>
          </motion.div>

          {loadingTestimonials ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <EmptyState
              title="Erro ao carregar depoimentos"
              description={error}
              icon={MessageSquarePlus}
            />
          ) : testimonials.length === 0 ? (
            <EmptyState
              title="Nenhum depoimento encontrado"
              description="Ainda não temos depoimentos para mostrar. Seja o primeiro a compartilhar sua experiência!"
              icon={MessageSquarePlus}
              action={
                isAuthenticated && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <MessageSquarePlus className="mr-2 h-5 w-5" />
                    Adicionar Depoimento
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials?.map((testimonial, index) => (
                  <TestimonialCard 
                    key={testimonial.testimonialId}
                    testimonial={{
                      ...testimonial,
                      name: testimonial?.author?.fullName || testimonial?.author?.username,
                      role: testimonial?.author?.role || testimonial.externalRole,
                      avatar: testimonial?.author?.avatarUrl || testimonial.externalAvatarUrl || '/images/avatar-placeholder.svg',
                      rating: testimonial.rating,
                      content: testimonial.content,
                      date: testimonial.createdAt,
                      featured: testimonial.featured
                    }}
                    index={index}
                  />
                ))}
              </div>

              <div className="text-center mt-12">
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-custom-primary hover:bg-custom-primary-hover text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg"
                  >
                    <MessageSquarePlus className="mr-2 h-5 w-5" />
                    Compartilhe sua experiência
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Quer compartilhar sua experiência?
                    </p>
                    <Link
                      to="/signin"
                      className="inline-flex items-center px-6 py-3 bg-custom-primary hover:bg-custom-primary-hover text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg"
                    >
                      Faça login para deixar seu depoimento
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modal de formulário para novo testemunho */}
      <TestimonialFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddTestimonial}
        user={user}
      />

      {/* CTA Section - Design moderno com gradiente */}
      <section className="py-20 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full mix-blend-overlay"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-indigo-300 rounded-full mix-blend-overlay"></div>
          <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-purple-300 rounded-full mix-blend-overlay"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Pronto para transformar sua <span className="text-yellow-300">jornada</span>?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mb-10 text-indigo-100 dark:text-gray-300 text-lg"
          >
            Junte-se a milhares de estudantes e instrutores em nossa comunidade educacional
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-custom-primary text-white font-semibold rounded-full hover:bg-custom-primary-hover transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Acessar Plataforma
              </Link>
            ) : (
              <>
                <Link
                  to="/signup?as=student"
                  className="px-8 py-4 bg-custom-primary text-white font-semibold rounded-full hover:bg-custom-primary-hover transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Criar Conta Gratuita
                </Link>
                <Link
                  to="/signup?as=instructor"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-custom-primary transition-all transform hover:scale-105"
                >
                  Tornar-se Instrutor
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}