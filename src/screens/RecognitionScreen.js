import React, { useState, useEffect, useRef } from 'react'
import {Camera} from 'expo-camera'
import TFModel from '../components/TFModel'
import ImageEditor from "@react-native-community/image-editor";
import {StyleSheet, Text, View, TouchableOpacity, Platform, ImageBackground} from 'react-native'

export default function RecognitionScreen() {
  DESIRED_RATIO = '1:1'

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [ratio, setRatio] = useState('')
  const cameraRef = useRef(null)

  const [previewVisible, setPreviewVisible] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)

  const [predictions, setPredictions] = useState('')

  const [prepareModel, classifyImage] = TFModel();

  // get permission first
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync()
      setHasPermission(status === 'granted')
      console.log('in useeffect');
      prepareModel()
    })()
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  } else {
    console.log('got permission, from screen');
  }

  // change the ratio of camera
  prepareRatio = async () => {
    if (Platform.OS === 'android' && cameraRef){
      const ratios = await cameraRef.current.getSupportedRatiosAsync();
      setRatio(ratios.find((ratio) => ratio === DESIRED_RATIO) || ratios[ratios.length - 1])
    }
  }

  // take picture, not finished
  const takePicture = async () => {
    if (!cameraRef) return
    let photo = await cameraRef.current.takePictureAsync().then(({ uri, width, height }) => {
      ImageEditor.cropImage(uri, {
         offset: { x: 0, y: 0 },
         size: { width, height },
         displaySize: { width: 400, height: 400},
      })
    })
    console.log(photo)

    setPreviewVisible(true)
    setCapturedImage(photo)
    console.log('passing image to model');
    const predictions = classifyImage(photo.uri)
    setPredictions(predictions)
  }

  const retakePicture = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
  }

  // not yet tested
  const CameraPreview = ({photo}) => {
    console.log('sdsfds', photo)
    return (
      <ImageBackground
        source={{uri: photo && photo.uri}}
        style={styles.camera}
      />
    )
  }

  // the screen
  return (
    <View style={styles.container}>
      {previewVisible && capturedImage ? (
        <CameraPreview photo={capturedImage} />
      ) : (
        <Camera ref={cameraRef} onCameraReady={prepareRatio} style={styles.camera} type={type} ratio={ratio}>
          <View style={styles.redSquare}></View>
        </Camera>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={retakePicture}>
          <Text style={styles.text}> Retake </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePicture}
          style={{
          alignSelf: 'flex-end',
          width: 70,
          height: 70,
          bottom: 0,
          borderRadius: 50,
          backgroundColor: '#fff'
          }}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setType(
              type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            );
          }}>
          <Text style={styles.text}> Flip </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.predictionWrapper}>
        <Text style={styles.text}>
          Predictions: {predictions ? predictions.className : ''}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20
  },
  camera: {
    width: "100%",
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 0.25,
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: "space-between",
    padding: 15,
  },
  button: {
    flex: 0.3,
    alignSelf: 'center',
    alignItems: 'center',
  },
  rectangle: {
    borderWidth: 3,
    borderColor: 'red',
    width: '70%',
    height: '70%',
  },
  text: {
    fontSize: 18,
    color: 'yellow',
  },
});