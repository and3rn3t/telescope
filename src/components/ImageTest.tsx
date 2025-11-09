// Simple test component to verify images work
export function ImageTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Image Test Component</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Sample NASA Image (direct URL)</h3>
        <img
          src="https://images-assets.nasa.gov/image/PIA11195/PIA11195~thumb.jpg"
          alt="Webb's First Deep Field"
          style={{ width: '300px', height: '300px', objectFit: 'cover', border: '1px solid #ccc' }}
          onLoad={() => console.warn('✅ Direct image loaded')}
          onError={() => console.error('❌ Direct image failed')}
        />
      </div>

      <div>
        <h3>Placeholder for comparison</h3>
        <div
          style={{
            width: '300px',
            height: '300px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Placeholder
        </div>
      </div>
    </div>
  )
}
