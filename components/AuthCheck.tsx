import Link from 'next/link'
import { useContext } from 'react'
import { UserContext } from '../lib/context'

export default function AuthCheck(props) {
  const { username } = useContext(UserContext)

  // render this Component's children,
  // otherwise render some type of fallback or a Link
  return username
    ? props.children
    : props.fallback || <Link href="/enter">You must be signed in</Link>
}