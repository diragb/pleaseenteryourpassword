// Packages:
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { auth, database } from '@/firebase'
import { get, limitToFirst, query, ref, set } from 'firebase/database'
import { RecaptchaVerifier } from 'firebase/auth'
import useAuth from '@/hooks/useAuth'
import localforage from 'localforage'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'

// Imports:
import {
  ReloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'

// Components:
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import Head from 'next/head'

// Functions:
const Home = () => {
  // Constants:
  const formSchema = z.object({
    username: z
      .string()
      .min(2, 'Username must contain at least 2 characters')
      .max(50, 'Username should not be more than 50 characters'),
    password: z
      .string()
      .min(5, 'Password must contain at least 5 characters')
      .max(50, 'Password should not be more than 50 characters'),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })
  const {
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    setUsername,
    setPassword,
  } = useAuth()
  const router = useRouter()

  // State:
  const username = form.watch('username')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [doesUserExist, setDoesUserExist] = useState(true)
  const [usernames, setUsernames] = useState<string[]>([])
  const [usernameIndex, setUsernameIndex] = useState(0)

  // Functions:
  const onSuccessfulAuthentication = async (values: z.infer<typeof formSchema>) => {
    toast({
      title: 'Successful login!',
      description: 'Welcome to Please Enter Your Password. Enjoy!',
    })

    setIsAuthenticated(true)
    setUsername(values.username)
    setPassword(values.password)

    await localforage.setItem('isAuthenticated', true)
    await localforage.setItem('username', values.username)
    await localforage.setItem('password', values.password)

    router.push('/app')
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoggingIn(true)
      await (window as any).appVerifier.verify()

      if (doesUserExist) {
        const usernameSnapshot = await get(ref(database, `/usernames/${ values.username }`))
        if (!usernameSnapshot.exists()) {
          setDoesUserExist(false)

          toast({
            title: 'Please register first!',
            description: 'Your account does not exist. Would you like to register instead?',
          })
        } else {
          setDoesUserExist(true)
          const password = usernameSnapshot.val() as string
          
          if (password === values.password) await onSuccessfulAuthentication(values)
          else {
            const passwordSnapshot = await get(query(ref(database, `/passwords/${ values.password }`), limitToFirst(100)))
            const usernamesUsingThisPassword = (passwordSnapshot.val() ?? {}) as Record<string, boolean>
            const _usernames = Object.keys(usernamesUsingThisPassword)

            if (_usernames.length > 0) {
              setUsernames(_usernames)
              setUsernameIndex(0)
            } else {
              toast({
                title: 'Wrong password, moron!',
                description: `Is your password ${ password } by any chance? Just guessing..`,
                variant: 'destructive',
              })
            }
          }
        }
      } else {
        // Register user.
        await set(ref(database, `/usernames/${ values.username }`), values.password)
        await set(ref(database, `/passwords/${ values.password }/${ values.username }`), true)

        await onSuccessfulAuthentication(values)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Effects:
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }, [])

  useEffect(() => {
    setDoesUserExist(true)
  }, [username])

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/app')
  }, [router, isLoading, isAuthenticated])

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
      <div className='flex justify-center items-center flex-col gap-2 w-[100vw] h-[100vh]'>
        <div className='flex flex-col w-80'>
          {
            usernames.length > 0 && (
              <Card className='relative w-full mb-3'>
                <span className='absolute -top-1.5 -right-1.5 flex h-3 w-3'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-3 w-3 bg-rose-500'></span>
                </span>
                <CardHeader className='p-3'>
                  <CardTitle className='text-lg'>Are you <span className='font-extrabold'>{ usernames[usernameIndex] }</span>?</CardTitle>
                  <CardDescription className='text-sm'>
                    The password you&apos;ve entered belongs to <span className='font-bold'>@{ usernames[usernameIndex] }</span>{ usernames.length > 2 && ` and ${ usernames.length - 1 }+ other users`}.
                  </CardDescription>
                </CardHeader>
                <CardFooter className='flex justify-between p-3'>
                  <Button
                    size='sm'
                    className='h-7'
                    onClick={() => form.setValue('username', usernames[usernameIndex])}
                  >
                    Yes, it&apos;s me!
                  </Button>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      disabled={usernameIndex === 0}
                      onClick={() => setUsernameIndex(_usernameIndex => _usernameIndex - 1)}
                    >
                      <ChevronLeftIcon className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-7 w-7'
                      disabled={usernameIndex === usernames.length - 1}
                      onClick={() => setUsernameIndex(_usernameIndex => _usernameIndex + 1)}
                    >
                      <ChevronRightIcon className='h-4 w-4' />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          }
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-black'>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='elonmusk'
                        {...field}
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-black'>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={ showPassword ? 'mypassword123' : '•••••••' }
                        {...field}
                        type={ showPassword ? 'text' : 'password' }
                        endAdornment={
                          <div
                            className='font-semibold text-xs cursor-pointer select-none'
                            onClick={() => setShowPassword(_showPassword => !_showPassword)}
                          >
                            { showPassword ? 'Hide' : 'Show' }
                          </div>
                        }
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              <div id='recaptcha-container' className='w-full'></div>
              <Button
                className={cn('w-full', doesUserExist ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-emerald-700 hover:bg-emerald-600')}
                type='submit'
                disabled={isLoggingIn || isAuthenticated}
              >
                {
                  isLoggingIn && (
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  )
                }
                {
                  doesUserExist ? 'Login' : 'Register'
                }
              </Button>
            </form>
          </Form>
        </div>
        <div className='text-xs font-bold text-zinc-400 text-center uppercase scale-x-110 origin-center select-none mt-2'>Please Enter Your Password</div>
      </div>
    </>
  )
}

// Exports:
export default Home
