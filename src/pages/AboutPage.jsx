import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { FiAward, FiUsers, FiGlobe, FiBookOpen, FiLayers, FiClock, FiTrendingUp } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import PlatformLoader from "@/components/common/PlatformLoader";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useEffect, useState } from "react";
import Footer from "../components/common/Footer";
import api from "@/services/api";
import StatCard from "@/components/cards/StatCard";

export default function AboutPage() {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    institutions: 0
  });
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/users/stats');
        
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              Revolucionando a <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">Educação Digital</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-10 text-indigo-100 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Uma plataforma onde conhecimento, comunidade e crescimento se conectam
            </motion.p>
          </motion.div>
        </div>
        
        {/* Ondas decorativas */}
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

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 relative z-10 -mt-1">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <StatCard value={stats?.students} label="Estudantes" delay={0.1} />
            <StatCard value={stats?.courses} label="Cursos" delay={0.2} />
            <StatCard value={stats?.instructors} label="Instrutores" delay={0.3} />
            <StatCard value={stats?.institutions} label="Instituições" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Nossa História */}
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
              Nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Jornada</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Como começamos e para onde estamos indo
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-700 p-8 md:p-10 rounded-2xl shadow-lg"
            >
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  Fundada em 2023 por educadores e especialistas em tecnologia, nossa plataforma está sendo cuidadosamente construída para revolucionar a forma como o conhecimento é compartilhado e adquirido.
                </p>
                <p>
                  Estamos dando os primeiros passos com grande entusiasmo e comprometimento. A cada dia, novos recursos são implementados e melhorados, sempre com o objetivo de criar uma experiência educacional verdadeiramente transformadora para nossos usuários.
                </p>
                <p>
                  Acreditamos que a educação deve ser acessível, engajadora e, acima de tudo, relevante para os desafios do mundo moderno. É por isso que estamos combinando os melhores princípios pedagógicos com tecnologia inovadora, construindo passo a passo uma plataforma que atenda às necessidades do mercado moçambicano.
                </p>
                <p>
                  Nossa jornada está apenas começando, e convidamos você a fazer parte desta construção. Juntos, estamos criando um espaço onde o aprendizado pode transformar vidas e carreiras.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
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
              Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Valores</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Os princípios que guiam cada decisão que tomamos
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
                <FiBookOpen className="text-indigo-600 dark:text-indigo-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Excelência Educacional</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Cursos meticulosamente projetados com progressão lógica e resultados mensuráveis
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
                <FiUsers className="text-indigo-600 dark:text-indigo-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Comunidade Primeiro</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Espaços colaborativos onde o diálogo aprofunda o conhecimento
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
                <FiAward className="text-indigo-600 dark:text-indigo-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Impacto Real</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Sistema de avaliações e credenciais que validam o aprendizado real
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Missão */}
      <section className="py-20 bg-indigo-50 dark:bg-gray-700 rounded-2xl mx-6 md:mx-10 mb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <FiGlobe className="mx-auto text-indigo-600 dark:text-indigo-300 text-5xl mb-6" />
            <blockquote className="text-2xl md:text-3xl font-light italic text-gray-800 dark:text-gray-200">
              "Nossa missão é democratizar o acesso à educação de qualidade, criando pontes entre especialistas e aprendizes em um ecossistema dinâmico."
            </blockquote>
            <div className="mt-8 text-gray-600 dark:text-gray-300">
              <p>— Equipe Fundadora</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tecnologia */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tecnologia a Serviço do <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Conhecimento</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
              Como construímos uma experiência de aprendizado excepcional
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="bg-indigo-100 dark:bg-gray-600 p-3 rounded-lg mr-4">
                  <FiLayers className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Arquitetura Modular</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Plataforma construída com microserviços para escalabilidade e performance
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="bg-indigo-100 dark:bg-gray-600 p-3 rounded-lg mr-4">
                  <FiClock className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Aprendizado Adaptativo</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sistemas de recomendação que personalizam a jornada de cada aluno
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="bg-indigo-100 dark:bg-gray-600 p-3 rounded-lg mr-4">
                  <FiTrendingUp className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Análise de Dados</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Dashboard avançados para instrutores acompanharem o progresso dos alunos
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            Pronto para começar sua <span className="text-yellow-300">jornada</span>?
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
                className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Acessar Plataforma
              </Link>
            ) : (
              <>
                <Link
                  to="/register?as=student"
                  className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Criar Conta Gratuita
                </Link>
                <Link
                  to="/register?as=instructor"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-indigo-700 transition-all transform hover:scale-105"
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