import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatPrice';

const CourseCard = ({ course }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        <img 
          src={course.coverImageUrl || '/images/thumbnail-placeholder.svg'} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/images/thumbnail-placeholder.svg';
          }}
        />
        <div className="absolute top-3 right-3 bg-custom-primary text-white text-xs px-3 py-1 rounded-full shadow-md">
          {course.level}
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
          {course.title}
        </h3>
        <div className="flex items-center mb-3">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
                alt="Student"
                className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            +{Math.floor(Math.random() * 100)} alunos
          </span>
        </div>
        <p 
          className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: course.description }} 
        />
        <div className="flex justify-between items-center">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            {formatPrice(course.price)}
          </span>
          <Link 
            to={`/courses/${course.slug}`}
            className="text-sm px-4 py-2 bg-custom-primary text-white rounded-full hover:bg-custom-primary-hover transition-colors"
          >
            Ver curso
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;