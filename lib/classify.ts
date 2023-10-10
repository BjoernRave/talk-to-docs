import { Ollama } from 'langchain/llms/ollama'
import { PromptTemplate } from 'langchain/prompts'

const UsefulnessTemplate = PromptTemplate.fromTemplate(`
You you know everything about rating things based on a list of criteria.

The criteria are:
 - How useful is this information for someone who is visiting a new city?
 - 

You will rate on a scale from 1 to 10, where 1 is not useful at all and 10 is very useful.
You will only return the rating as a number and nothing more.

The text you will rate is:
{text}



`)

const ollama = new Ollama({
  baseUrl: 'http://localhost:11434', // Default value
  model: 'mistral:text', // Default value
})

const test = async () => {
  const res = await ollama.invoke(
    'Hey, can you give me a list of the 10 best restaurants in Hamburg?'
  )

  console.log(res)
}

test()
