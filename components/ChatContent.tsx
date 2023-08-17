import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from './CodeBlock'
const ChatContent: FC<Props> = ({ content }) => {
  const sections = content.split('```')
  return (
    <div>
      {sections.map((section, index) => {
        if (index % 2 === 0) {
          // Even sections are regular text
          return (
            <ReactMarkdown className='prose' key={index}>
              {section}
            </ReactMarkdown>
          )
        } else {
          // Remove language identifier (e.g., bash, typescript)
          const code = section.split('\n').slice(1).join('\n')
          const language = section.split('\n')[0]

          console.log(section)

          return <CodeBlock key={index} language={language} code={code} />
        }
      })}
    </div>
  )
}

export default ChatContent

interface Props {
  content: string
}
