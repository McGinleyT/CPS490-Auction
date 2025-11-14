import { Header } from '../components/Header.jsx'
import { User } from '../components/User.jsx'
import { useLocation } from 'react-router-dom'

export function Item() {
  const location = useLocation()
  const post = location.state?.post
  const { title, contents, author, createdAt } = post
  return (
    <div>
      <Header />
      <hr style={{ padding: 32 }} />
      <p className='title'>{title}</p>
      <div className='align-center'>
        <div>
          {contents}
          <br />
          {author && (
            <em>
              <br />
              Written by <User id={author} />
              Created at {createdAt}
            </em>
          )}
        </div>
      </div>
    </div>
  )
}
