import PropTypes from 'prop-types'
import { User } from './User.jsx'
import { Link } from 'react-router-dom'

export function Post({ _id, title, contents, author, endDate, image }) {
  const endDateString = new Date(endDate).toLocaleString()
  if (endDate <= new Date()) {
    return (
      <article className='post postExpired'>
        <img alt='postimage' src={image} />
        <div className='body'>
          <h1>{title}</h1>
          <div>{contents}</div>
          <div>Ending: {endDateString}</div>
          {author && (
            <div>
              Written by:
              <User id={author} />
            </div>
          )}
          <br />
          <h2
            style={{
              color: 'crimson',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            This auction is over!
          </h2>
        </div>
      </article>
    )
  }

  return (
    <article className='post'>
      <Link to={`/posts/${_id}`} className='PostLink'>
        <img alt='postimage' src={image} />
        <div className='body'>
          <h1>{title}</h1>
          <div>{contents}</div>
          <div>Ending: {endDateString}</div>
          {author && (
            <div>
              Seller:&nbsp;
              <User id={author} />
            </div>
          )}
        </div>
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
