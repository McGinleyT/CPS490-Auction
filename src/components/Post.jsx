import PropTypes from 'prop-types'
import { User } from './User.jsx'
import { Link } from 'react-router-dom'

export function Post({ _id, title, contents, author, endDate, image }) {
  const endDateString = new Date(endDate).toLocaleString()
  return (
    <article className='post'>
      <Link to={`/posts/${_id}`} className='PostLink'>
        <img alt='postimage' src={image} />
        <p>
          <h>{title}</h>
          <div>{contents}</div>
          <div>Ending: {endDateString}</div>
          {author && (
            <div>
              Written by:
              <User id={author} />
            </div>
          )}
        </p>
      </Link>
    </article>
  )
}

Post.propTypes = {
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  author: PropTypes.string,
  endDate: PropTypes.number,
  image: PropTypes.string,
}
