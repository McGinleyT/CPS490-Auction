import PropTypes from 'prop-types'
import { User } from './User.jsx'

export function Post({ title, contents, author }) {
  return (
    <article className='Post'>
      <img alt='postimage' src='./src/assets/redmower.png'></img>
      <h3>{title}</h3>
      <div>{contents}</div>
      {author && (
        <div>
          <br />
          Written by <User id={author} />
        </div>
      )}
    </article>
  )
}

Post.propTypes = {
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  author: PropTypes.string,
}
