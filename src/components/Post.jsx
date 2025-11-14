import PropTypes from 'prop-types'
import { User } from './User.jsx'
import { Link } from 'react-router-dom'

export function Post({ _id, title, contents, author, endDate }) {
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
      <div>Last day to bid: {endDate}</div>
      <Link to={`/posts/${_id}`} className='PostLink'>
        <img alt='postimage' src='./src/assets/redmower.png' />
        <h3>{title}</h3>
        <div>{contents}</div>
        {author && (
          <div>
            <br />
            Written by <User id={author} />
          </div>
        )}
      </Link>
    </article>
  )
}

Post.propTypes = {
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  author: PropTypes.string,
  endDate: PropTypes.string,
}
