// Test file to verify sample images are working
import { fetchJWSTImages } from './src/lib/nasa-api.js'

console.log('Testing JWST image fetch...')

fetchJWSTImages()
  .then(images => {
    console.log(`Received ${images.length} images`)
    console.log('First image:', images[0])
  })
  .catch(error => {
    console.error('Error:', error)
  })