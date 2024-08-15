// Packages:
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import useAuth from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'
import { database } from '@/firebase'
import { get, ref, set } from 'firebase/database'
import localforage from 'localforage'

// Imports:
import { ReloadIcon } from '@radix-ui/react-icons'

// Components:
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Head from 'next/head'

// Functions:
const App = () => {
  // Constants:
  const {
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    username,
    setUsername,
    setPassword,
  } = useAuth()
  const formSchema = z.object({
    note: z
      .string()
      .min(1, 'C\'mon, add something..')
      .max(1000, 'Okay, that\'s enough words')
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: '',
    },
  })
  const router = useRouter()

  // State:
  const [isNoteLoaded, setIsNoteLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Functions:
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      await set(ref(database, `/notes/${ username }`), values.note)
      const noteSnapshot = await get(ref(database, `/notes/${ username }`))
      form.setValue('note', noteSnapshot.val() as string)

      toast({
        title: 'Note added!',
        description: 'Your note will be visible only to your account.'
      })
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = async () => {
    setIsAuthenticated(false)
    setUsername(undefined)
    setPassword(undefined)

    await localforage.setItem('isAuthenticated', false)
    await localforage.removeItem('username')
    await localforage.removeItem('password')

    router.push('/')
  }

  // Effects:
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/')
  }, [router, isLoading, isAuthenticated])

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      !isNoteLoaded &&
      username
    ) {
      (async () => {
        setIsNoteLoaded(true)
        const noteSnapshot = await get(ref(database, `/notes/${ username }`))
        if (noteSnapshot.exists()) {
          form.setValue('note', noteSnapshot.val() as string)
        }
      })()
    }
  }, [
    form,
    isLoading,
    isAuthenticated,
    isNoteLoaded,
    username,
  ])

  // Return:
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#000000' />
        <meta name='description' content={ 'Please enter your password.' } />
        <meta name='image' content='https://pleaseenteryourpassword.web.app/square-cover.jpg' />
        <meta property='og:url' content='https://pleaseenteryourpassword.web.app' />
        <meta property='og:type' content='article' />
        <meta property='og:title' content={ 'Please Enter Your Password' } />
        <meta property='og:description' content={ 'Please enter your password.' } />
        <meta property='og:image' content='https://pleaseenteryourpassword.web.app/square-cover.jpg' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:creator' content='pleaseenteryourpassword.web.app' />
        <meta name='twitter:title' content={ 'Please Enter Your Password' } />
        <meta name='twitter:description' content={ 'Please enter your password.' } />
        <meta name='twitter:image' content='https://pleaseenteryourpassword.web.app/rect-cover.jpg' />
        <meta name='twitter:image:alt' content={ 'Please Enter Your Password' } />
        <title>{ 'Please Enter Your Password' }</title>
      </Head>
      <div className='flex justify-center items-center flex-col w-[100vw] h-[100vh]'>
        <div className='flex flex-col gap-3 w-80'>
          <div className='flex flex-col gap-1'>
            <div>Hi <span className='font-bold text-lg'>@{ username }</span>!</div>
            <div className='font-medium text-sm text-zinc-500'>How are you doing today?</div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-black'>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add a note for others to see..'
                        {...field}
                        className='resize-none'
                        disabled={isSubmitting || !isNoteLoaded}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              <Button
                className={cn('w-full', 'bg-emerald-700 hover:bg-emerald-600')}
                type='submit'
                disabled={isSubmitting || !isNoteLoaded || !isAuthenticated}
              >
                {
                  isSubmitting ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      Adding Your Note..
                    </>
                  ) : (
                    'Add Note'
                  )
                }
              </Button>
            </form>
          </Form>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t'></span>
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>Or</span>
            </div>
          </div>
          <Button
            className='w-full'
            onClick={logout}
            variant='outline'
          >
            Log Out
          </Button>
          <div className='text-xs font-bold text-zinc-400 text-center uppercase scale-x-110 origin-center select-none mt-2'>Please Enter Your Password</div>
        </div>
      </div>
    </>
  )
}

// Exports:
export default App
