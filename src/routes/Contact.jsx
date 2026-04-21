import { Typewriter } from '@/components/Typewriter'
import { SectionLabel } from '@/components/SectionLabel'
import { ChatBubble } from '@/components/ChatBubble'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <SectionLabel index={7}>CONTACT</SectionLabel>
        <Typewriter as="h1" speed="slow">Let's talk.</Typewriter>
      </header>

      <div className={styles.layout}>
        <div>
          <div className={styles.links}>
            <a href="mailto:alexwilcox3@icloud.com">alexwilcox3@icloud.com</a>
            <a href="https://github.com/AlexJohnWilcox" target="_blank" rel="noopener noreferrer">github.com/AlexJohnWilcox</a>
            <a href="https://www.linkedin.com/in/alexjwilcox/" target="_blank" rel="noopener noreferrer">linkedin.com/in/alexjwilcox</a>
          </div>
          <a className={styles.cta} href="/Images/Resume-Wilcox,A.pdf" target="_blank" rel="noopener noreferrer">[ DOWNLOAD RESUME ]</a>
        </div>

        <div className={styles.chatShell}>
          <ChatBubble embedded />
        </div>
      </div>
    </div>
  )
}
