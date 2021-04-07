import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';
import ImageUploader from '../../components/ImageUploader'

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  )
}

function PostManager() {
  const [preview, setPreview] = useState(false)

  const router = useRouter()
  let slug

  if (Array.isArray(router.query.slug)) {
    slug = router.query.slug[0]
  } else {
    slug = router.query.slug
  }

  const postRef = firestore
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('posts')
    .doc(slug)
  
  const [post] = useDocumentDataOnce(postRef)

  // todo
  const deletePost = async () => {
    if (confirm('Are you sure you want to delete this Post?')) {
      const batch = firestore.batch()
      batch.delete(postRef)
  
      try {
        await batch.commit()
        router.push('/admin')
        toast.success('Post deleted successfully!')
    } catch (error) {
        console.log({ error });
      }
    }
  }

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <button className="btn-red" onClick={deletePost}>Delete</button>
          </aside>
        </>
      )}
    </main>
  )
}

function PostForm({ defaultValues, postRef, preview}) {
  const { 
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    errors
  } = useForm({ defaultValues, mode: 'onChange' })

  const { isValid, isDirty } = formState

  const updatePost = async({ content, published }) => {
    await postRef.update({
      content,
      published,
      updatedAt: serverTimestamp()
    })

    reset({ content, published })

    toast.success('Post updated successfully!')
  }

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>

        <ImageUploader />

        <textarea name="content" ref={register({
          maxLength: { value: 20000, message: 'content is too long' },
          minLength: { value: 10, message: 'content is too short' },
          required: { value: true, message: 'content is required' }
        })}></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
          <input
            type="checkbox"
            className={styles.checkbox}
            name="published"
            id="published"
            ref={register}
          />
          <label htmlFor="published">Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isValid || !isDirty}>
          Save Changes
        </button>
      </div>
    </form>
  )
}
