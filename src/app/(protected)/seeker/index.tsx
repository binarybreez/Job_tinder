import { Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const index = () => {
  return (
      <View>
      <Text className='font-bold text-2xl'>Hinge Jobs</Text>
      <Link href={"/(protected)/seeker/Role"}>To the Role Section</Link>
      </View>
  )
}

export default index

