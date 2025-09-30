import { motion } from 'framer-motion';
import { Star, BadgeCheck, Quote } from 'lucide-react';
import Avatar from '../common/Avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 group dark:bg-gray-900/50">
        <CardHeader className="flex flex-row items-start space-y-0 pb-4">
          <div className="relative">
            <Avatar 
              src={testimonial.avatar || '/images/placeholder.png'}
              alt={testimonial.name}
              size="md"
              className="mb-1"
            />
            
            {testimonial?.featured && (
              <Badge variant="premium" className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-gray-50/20">
                <BadgeCheck className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow relative px-6 pb-6">
          <Quote className="absolute top-0 left-2 w-5 h-5 text-primary/20" />
          <p className="text-muted-foreground italic pl-6">
            {testimonial.content}
          </p>
          <Quote className="absolute bottom-0 right-2 w-5 h-5 text-primary/20 rotate-180" />
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted fill-muted/10'}`}
              />
            ))}
          </div>
          
          {testimonial.date && (
            <span className="text-xs text-muted-foreground">
              {new Date(testimonial.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TestimonialCard;