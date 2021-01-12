import React, {useState} from 'react'

import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { fetch } from '@tensorflow/tfjs-react-native'

import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'

import * as jpeg from 'jpeg-js'
import * as FileSystem from 'expo-file-system'

export default function TFModel() {
  const [ready, setReady] = useState(false)
  const model = null

  const prepareModel = async () => {
    await tf.ready()
    this.model = await mobilenet.load({version: 2, alpha: 1.0})
    getPermissionAsync()
    setReady(true)
  }

  const getPermissionAsync = async () => {
    if (Constants.platform.ios || Constants.platform.android) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA)
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
    }
  }

  const imageToTensor = (rawImageData) => {
    const TO_UINT8ARRAY = true
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]

      offset += 4
    }
    return tf.tensor3d(buffer, [height, width, 3])
  }

  const classifyImage = async (uri) => {
    if (ready === false){
      console.log('model.error');
      return 'model error'
    }
    console.log('received image from: ', uri);
    try {
      const imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const rawImageData = new Uint8Array(tf.util.encodeString(imgB64, 'base64').buffer)  
      
      const imageTensor = imageToTensor(rawImageData)
      const predictions = await this.model.classify(imageTensor)

      console.log(predictions)
      return predictions
    } catch (error) {
      console.log(error)
    }
  }

  return [prepareModel, classifyImage]
}