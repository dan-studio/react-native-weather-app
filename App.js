import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { API_KEY } from "@env";
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window"); //디바이스별 넓이를 측정해 줌

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Snow: "snowflake",
  Atmosphere: 'cloudy-gusts',
  Rain: 'rains',
  Drizzle: 'rain',
  Thunderstorm: 'lightning'
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [location, setLocation] = useState(null);
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync(); // 위치정보 제공 동의여부
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 }); // 위치 정확도
    const location = await Location.reverseGeocodeAsync(
      //위도와 경도에 따른 위치정보 제공
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    setLocation(location[0].district + " " + location[0].streetNumber);
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric` // 위도와 경도에 따른 지역날씨 정보 제공
    );
    const json = await response.json();
    setDays(json.daily);
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.districtName}>{location}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={{...styles.day, alignItems:"center"}}>
            <ActivityIndicator
              style={{ marginTop: 10 }}
              color="white"
              size="large"
            />
          </View>
        ) : (
          days.map((day, idx) => (
            <View key={idx} style={styles.day}>
              <View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent:"space-between"}}>
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                  {/*소수점 첫번째 자리까지 출력*/}
                </Text>
                <Fontisto name={icons[day.weather[0].main]} size={80} color="white" style={{marginTop: 80, marginRight: 30}} />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1aacff",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 58,
    color: "white",
    fontWeight: "500",
  },
  districtName: {
    fontSize: 24,
    marginTop: 20,
    color: "white",
    fontWeight: "400",
  },
  weather: {
    backgroundColor: "#1aacff",
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingLeft: 30,
  },
  temp: {
    color: "white",
    marginTop: 50,
    fontSize: 108,
  },
  description: {
    color: "white",
    marginTop: -10,
    fontSize: 40,
  },
  tinyText: {
    fontSize: 20,
    marginTop: 10,
    color: "white",
  },
});
