import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    console.log(emailAddress, password)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    )
  }

  return (
    <SafeAreaView className="flex items-center justify-center h-full">
      <View className="border-2 border-black rounded-xl p-4 w-[95%] h-fit">
        <Text className="font-extrabold text-4xl mb-8">Sign up</Text>
        <TextInput
        className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />
        <TextInput
        className="border-2 rounded-3xl border-gray-300 px-3 font-semibold text-[15px] mb-4"
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <TouchableOpacity onPress={onSignUpPress} className="flex items-center justify-center">
          <Text className="font-bold text-[18px] border-2 border-gray-500 rounded-2xl w-[50%] text-center py-1">Continue</Text>
        </TouchableOpacity>
        <View className="flex-row gap-3 items-center justify-center mt-2">
          <Text className="text-lg text-gray-700">Already have an account?</Text>
          <Link href="/sign-in">
            <Text>Sign in</Text>
          </Link>
        </View>
          <Link href="/employer">
            <Text>Go To Employer Dash</Text>
          </Link>
          <Link href="/seeker">
            <Text>Go To Seeker Dash</Text>
          </Link>
      </View>
    </SafeAreaView>
  )
}