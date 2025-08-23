import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const StatCard = ({ value, label, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        scale: [1, 1.1, 1],
        opacity: 1,
        transition: { duration: 0.5, delay }
      });
    }
  }, [inView, controls, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={controls}
      className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 shadow-md"
    >
      <motion.h3 
        className="text-5xl font-bold text-custom-primary mb-2"
        whileHover={{ scale: 1.05 }}
      >
        {value.toLocaleString()}+
      </motion.h3>
      <p className="text-gray-600 dark:text-gray-300 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatCard;