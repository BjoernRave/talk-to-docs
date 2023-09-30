import fs from 'fs'
import fetch from 'node-fetch'

require('dotenv').config()

const convertToAudio = async (text: string) => {
  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
    {
      method: 'POST',
      headers: {
        accept: 'audio/mpeg',
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Lots of data and information is stored in tabular data, whether it be csvs, excel sheets, or SQL tables. This page covers all resources available in LangChain for working with data in this format.`,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  )

  if (!response.ok) {
    const res = await response.json()

    console.log(res)

    throw new Error('Failed to convert to audio')
  }

  //write the audio to a file
  const buffer = await response.buffer()
  fs.writeFileSync('audio2.mp3', buffer)
}

convertToAudio('hello world')
