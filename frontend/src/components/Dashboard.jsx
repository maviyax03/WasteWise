import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
    cardboard: '#F59E0B',
    glass: '#61DAFB',
    metal: '#A78BFA',
    paper: '#4ADE80',
    plastic: '#F87171',
    trash: '#778899'
};

const Dashboard = ({ stats }) => {
    if (!stats) return null;

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                Dashboard
            </h1>
            <p style={{ color: '#778899', marginBottom: '2rem' }}>
                Overview of all waste classifications
            </p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1E2D3D' }}>
                    <p style={{ color: '#778899', fontSize: '13px', margin: '0 0 4px 0' }}>Total Classifications</p>
                    <p style={{ color: '#4ADE80', fontSize: '32px', fontWeight: '700', margin: 0 }}>{stats.total}</p>
                </div>
                <div style={{ background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1E2D3D' }}>
                    <p style={{ color: '#778899', fontSize: '13px', margin: '0 0 4px 0' }}>Most Common</p>
                    <p style={{ color: '#F59E0B', fontSize: '32px', fontWeight: '700', margin: 0, textTransform: 'capitalize' }}>
                        {stats.by_category[0]?.category || '—'}
                    </p>
                </div>
                <div style={{ background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1E2D3D' }}>
                    <p style={{ color: '#778899', fontSize: '13px', margin: '0 0 4px 0' }}>Categories Detected</p>
                    <p style={{ color: '#61DAFB', fontSize: '32px', fontWeight: '700', margin: 0 }}>{stats.by_category.length}</p>
                </div>
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {/* Pie chart */}
                <div style={{ background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1E2D3D' }}>
                    <p style={{ color: '#CCDDEE', fontWeight: '600', marginBottom: '1rem' }}>By Category</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={stats.by_category}
                                dataKey="count"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ category }) => category}
                            >
                                {stats.by_category.map((entry) => (
                                    <Cell key={entry.category} fill={COLORS[entry.category] || '#778899'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div style={{ background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1E2D3D' }}>
                    <p style={{ color: '#CCDDEE', fontWeight: '600', marginBottom: '1rem' }}>Count by Category</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.by_category}>
                            <XAxis dataKey="category" tick={{ fill: '#778899', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#778899', fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {stats.by_category.map((entry) => (
                                    <Cell key={entry.category} fill={COLORS[entry.category] || '#778899'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Line chart */}
            {stats.trend.length > 0 && (
                <div style={{ background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1E2D3D' }}>
                    <p style={{ color: '#CCDDEE', fontWeight: '600', marginBottom: '1rem' }}>Classifications Over Time (Last 7 Days)</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={stats.trend}>
                            <XAxis dataKey="date" tick={{ fill: '#778899', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#778899', fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#4ADE80" strokeWidth={2} dot={{ fill: '#4ADE80' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Dashboard;