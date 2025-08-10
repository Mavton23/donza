import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function InstitutionReviewDashboard({ filters, onFilterChange, data }) {
  const ratingDistribution = [
    { name: '5 Stars', value: data.filter(r => r.rating === 5).length },
    { name: '4 Stars', value: data.filter(r => r.rating === 4).length },
    { name: '3 Stars', value: data.filter(r => r.rating === 3).length },
    { name: '2 Stars', value: data.filter(r => r.rating === 2).length },
    { name: '1 Star', value: data.filter(r => r.rating === 1).length },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium">Total Reviews</h3>
          <p className="text-2xl">{data.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium">Average Rating</h3>
          <p className="text-2xl">
            {data.reduce((sum, review) => sum + review.rating, 0) / data.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-medium">Response Rate</h3>
          <p className="text-2xl">
            {(data.filter(r => r.instructorReply).length / data.length * 100 || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-medium mb-4">Rating Distribution</h3>
        <BarChart width={500} height={300} data={ratingDistribution}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-medium mb-4">Recent Negative Reviews</h3>
        {data
          .filter(r => r.rating <= 2)
          .slice(0, 5)
          .map(review => (
            <div key={review.reviewId} className="border-b border-gray-200 dark:border-gray-700 py-3">
              <p className="font-medium">{review.title}</p>
              <Rating value={review.rating} size="sm" />
              <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
      </div>
    </div>
  );
}