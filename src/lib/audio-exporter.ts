import { Track } from '@/hooks/use-audio-player-context'

export const renderPlaylistMix = async (
  tracks: Track[],
  crossfadeDuration: number = 2,
): Promise<Blob> => {
  // Use OfflineAudioContext to render
  // This is simplified and requires tracks to be loadable (blob or CORS enabled URL)

  // 1. Estimate duration
  // We need to fetch durations properly or buffer them first.
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext
  const tempCtx = new AudioContextClass()

  // Load all buffers
  const buffers: AudioBuffer[] = []

  for (const track of tracks) {
    try {
      let buffer: AudioBuffer
      if (track.file) {
        const arrayBuffer = await track.file.arrayBuffer()
        buffer = await tempCtx.decodeAudioData(arrayBuffer)
      } else if (track.url) {
        const response = await fetch(track.url)
        const arrayBuffer = await response.arrayBuffer()
        buffer = await tempCtx.decodeAudioData(arrayBuffer)
      } else {
        // Mock a silent buffer if missing
        buffer = tempCtx.createBuffer(
          2,
          tempCtx.sampleRate * 2,
          tempCtx.sampleRate,
        )
      }
      buffers.push(buffer)
    } catch (e) {
      console.warn(`Failed to load track ${track.title} for export`, e)
      // Mock silence
      const buffer = tempCtx.createBuffer(
        2,
        tempCtx.sampleRate * 2,
        tempCtx.sampleRate,
      )
      buffers.push(buffer)
    }
  }

  // Calculate total length
  let totalLength = 0
  let currentOffset = 0

  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i]
    if (i === 0) {
      totalLength += buf.duration
      currentOffset += buf.duration
    } else {
      totalLength += buf.duration - crossfadeDuration
      currentOffset += buf.duration - crossfadeDuration
    }
  }

  // Round up sample rate
  const sampleRate = 44100
  const offlineCtx = new OfflineAudioContext(
    2,
    totalLength * sampleRate,
    sampleRate,
  )

  // Schedule Buffers
  let startTime = 0

  for (let i = 0; i < buffers.length; i++) {
    const buffer = buffers[i]
    const source = offlineCtx.createBufferSource()
    source.buffer = buffer

    // Create gain for crossfading
    const gain = offlineCtx.createGain()
    source.connect(gain)
    gain.connect(offlineCtx.destination)

    source.start(startTime)

    // Fade In (if not first)
    if (i > 0) {
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(1, startTime + crossfadeDuration)
    } else {
      gain.gain.setValueAtTime(1, startTime)
    }

    // Fade Out (if not last)
    if (i < buffers.length - 1) {
      const endTime = startTime + buffer.duration
      gain.gain.setValueAtTime(1, endTime - crossfadeDuration)
      gain.gain.linearRampToValueAtTime(0, endTime)
    }

    // Advance start time
    if (i < buffers.length - 1) {
      startTime += buffer.duration - crossfadeDuration
    }
  }

  // Render
  const renderedBuffer = await offlineCtx.startRendering()

  // Convert to WAV Blob
  return bufferToWave(renderedBuffer, totalLength)
}

// Utility to convert AudioBuffer to WAV Blob
function bufferToWave(abuffer: AudioBuffer, len: number) {
  const numOfChan = abuffer.numberOfChannels
  const length = len * abuffer.sampleRate * numOfChan * 2 + 44
  const buffer = new ArrayBuffer(length)
  const view = new DataView(buffer)
  const channels = []
  let i
  let sample
  let offset = 0
  let pos = 0

  // write WAVE header
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(abuffer.sampleRate)
  setUint32(abuffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
  setUint16(numOfChan * 2) // block-align
  setUint16(16) // 16-bit (hardcoded in this example)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4) // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i))

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])) // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
      view.setInt16(44 + pos, sample, true) // write 16-bit sample
      pos += 2
    }
    offset++ // next source sample
  }

  return new Blob([buffer], { type: 'audio/wav' })

  function setUint16(data: any) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32(data: any) {
    view.setUint32(pos, data, true)
    pos += 4
  }
}
