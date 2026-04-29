import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { classifyImage } from '../utils/api';

const CATEGORY_COLORS = {
    cardboard: '#F59E0B',
    glass: '#61DAFB',
    metal: '#A78BFA',
    paper: '#4ADE80',
    plastic: '#F87171',
    trash: '#778899',
    unknown: "#94A3B8"
};

const CATEGORY_ICONS = {
    cardboard: '📦',
    glass: '🪟',
    metal: '🔩',
    paper: '📄',
    plastic: '🧴',
    trash: '🗑️',
    unknown: "❓"
};

const ClassifyCard = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1
    });

    const handleClassify = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);
        try {
            const data = await classifyImage(image);
            setResult(data);
        } catch (err) {
            setError('Classification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                Waste Classifier
            </h1>
            <p style={{ color: '#778899', marginBottom: '2rem' }}>
                Upload an image of waste and our AI will classify it instantly.
            </p>

            {/* Dropzone */}
            <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? '#4ADE80' : '#1E2D3D'}`,
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive ? '#0D1F0D' : '#111827',
                transition: 'all 0.2s',
                marginBottom: '1rem'
            }}>
                <input {...getInputProps()} />
                {preview ? (
                    <img src={preview} alt="preview" style={{
                        maxHeight: '250px',
                        maxWidth: '100%',
                        borderRadius: '8px'
                    }} />
                ) : (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📸</div>
                        <p style={{ color: '#778899' }}>
                            {isDragActive ? 'Drop it here!' : 'Drag & drop an image or click to browse'}
                        </p>
                    </>
                )}
            </div>

            {/* Classify Button */}
            <button
                onClick={handleClassify}
                disabled={!image || loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: image && !loading ? '#4ADE80' : '#1E2D3D',
                    color: image && !loading ? '#0A0F1E' : '#778899',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: image && !loading ? 'pointer' : 'not-allowed',
                    marginBottom: '1.5rem',
                    transition: 'all 0.2s'
                }}>
                {loading ? 'Classifying...' : 'Classify Waste'}
            </button>

            {/* Error */}
            {error && (
                <div style={{
                    background: '#1F0D0D',
                    border: '1px solid #F87171',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#F87171',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div style={{
                    background: '#111827',
                    border: `1px solid ${CATEGORY_COLORS[result.category]}`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '36px' }}>{CATEGORY_ICONS[result.category]}</span>
                        <div>
                            <p style={{ color: '#778899', fontSize: '13px', margin: 0 }}>Classified as</p>
                            <h2 style={{
                                color: CATEGORY_COLORS[result.category],
                                fontSize: '24px',
                                fontWeight: '700',
                                margin: 0,
                                textTransform: 'capitalize'
                            }}>
                                <p>
                                    {result.category === "unknown"
                                        ? "Result"
                                        : "Classified as"}
                                </p>
                                {result.category === "unknown" ? "No Waste Detected" : result.category}
                            </h2>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <p style={{ color: '#778899', fontSize: '13px', margin: 0 }}>Confidence</p>
                            <p style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                                {(result.confidence * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* All predictions */}
                    <div>
                        <p style={{ color: '#778899', fontSize: '13px', marginBottom: '8px' }}>All predictions</p>
                        {Object.entries(result.all_predictions)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, conf]) => (
                                <div key={cat} style={{ marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span style={{ color: '#CCDDEE', fontSize: '13px', textTransform: 'capitalize' }}>{cat}</span>
                                        <span style={{ color: '#CCDDEE', fontSize: '13px' }}>{(conf * 100).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ background: '#1E2D3D', borderRadius: '4px', height: '6px' }}>
                                        <div style={{
                                            background: CATEGORY_COLORS[cat],
                                            width: `${conf * 100}%`,
                                            height: '100%',
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassifyCard;