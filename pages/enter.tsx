import { auth, googleAuthProvider, firestore } from '../lib/firebase'
import { useContext, useEffect, useRef } from 'react'
import { UserContext } from '../lib/context'
import { useState } from 'react'

export default function EnterPage({ }) {
  const { user, username } = useContext(UserContext)

  return (
    <main>
      {user 
        ? !username ? <UsernameForm /> : <SignOutButton  />
        : <SignInButton />
      }
    </main>
  )
}

function SignInButton() {
  const signInWithGoogle = async () => {
    try {
      await auth.signInWithPopup(googleAuthProvider)
    } catch (error) {
      console.warn({ error })
    }
  }

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} /> Sign in with Google
    </button>
  )
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>
}

function UsernameForm() {
  const [formValue, setFormValue] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const id = useRef(null)

  const { user, username } = useContext(UserContext)

  const clear = () => window.clearInterval(id.current)

  useEffect(() => {
    id.current = window.setTimeout(() => {
      checkUsername(formValue)
    }, 500);

    return clear
  }, [formValue])

  const handleOnChange = (e) => {
    const val = e.target.value.toLowerCase()
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/

    if (val.length < 3) {
      setFormValue(val)
      setLoading(false)
      setIsValid(false)
    }

    if (re.test(val)) {
      setFormValue(val)
      setLoading(true)
      setIsValid(false)
    }
  }

  const checkUsername = async (username) => {
    if (username.length >= 3) {
      const ref = firestore.doc(`usernames/${username}`)
      const { exists } = await ref.get()
      console.log('Firestore read executed');
      setIsValid(!exists)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const userDoc = firestore.doc(`users/${user.uid}`)
      const usernameDoc = firestore.doc(`usernames/${formValue}`)
  
      const batch = firestore.batch()
      batch.set(userDoc, {
        username: formValue,
        photoURL: user.photoURL,
        displayName: user.displayName
      })
      batch.set(usernameDoc, { uid: user.uid })
  
      await batch.commit()
    } catch (error) {
      console.warn({ error })
    }
  }

  return (
    !username && (
      <section>
        <h3>Choose username</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Enter username..."
              value={formValue}
              onChange={handleOnChange}
            />
            <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
            <button type="submit" className="btn-green" disabled={!isValid}>
              Choose
            </button>

            <h3>Debug state</h3>
            <div>
              Username: {formValue}
              <br/>
              Loading: {loading.toString()}
              <br/>
              Username valid: {isValid.toString()}
            </div>
          </form>
      </section>
    )
  )
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>
  } else if (isValid) {
    return <p className="text-success">{username} is valid!</p>
  } else if (username.length >= 3 && !isValid) {
    return <p className="text-danger">{username} is already taken!</p>
  } else if (!isValid) {
    return <p className="text-danger">Invalid characters or username length!</p>
  } else {
    return <p></p>
  }
}
