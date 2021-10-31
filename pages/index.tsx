import { Card, Grid, Heading, ThemeProvider } from 'theme-ui'
import { Box, Label, Input, Button } from 'theme-ui'

import type { Theme } from 'theme-ui'
import { useEffect, useState } from 'react'
import { NextRouter, useRouter } from 'next/router'
import { ParsedUrlQueryInput } from 'querystring'
import { NextPage } from 'next'

const API_KEY = '8a5619300db405e4c80af88812815610'
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

export function updateQueryParam(
  router: NextRouter,
  query: ParsedUrlQueryInput,
): void {
  router.push(
    {
      pathname: window.location.pathname,
      query: query,
    },
    undefined,
  )
}

export const theme: Theme = {
  fonts: {
    body: 'system-ui, sans-serif',
    heading: '"Avenir Next", sans-serif',
    monospace: 'Menlo, monospace',
  },
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#33e',
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)',
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'muted',
    },
  },
}

function getCardinalDirection(angle: number) {
  const directions = [
    '↑ N',
    '↗ NE',
    '→ E',
    '↘ SE',
    '↓ S',
    '↙ SW',
    '← W',
    '↖ NW',
  ]
  return directions[Math.round(angle / 45) % 8]
}

interface Props {
  city: string
  weather?: Record<string, any>
}

const Home: NextPage<Props> = ({ city, weather }) => {
  const [location, setLocation] = useState(city)
  const [locationName, setLocationName] = useState('')
  const [data, setData] = useState([])
  const router = useRouter()

  const handleSearch = () => {
    updateQueryParam(router, { city: location })
  }

  console.log(weather)

  return (
    <ThemeProvider theme={theme}>
      <Grid width={[128, null, 192]}>
        <Box sx={{ mb: 4, p: 20 }}>
          <form onSubmit={(e) => handleSearch()}>
            <Label sx={{ mb: 2 }} htmlFor="city">
              Indtast by
            </Label>
            <Input
              sx={{ mb: 3 }}
              id="city"
              name="city"
              onChange={(input) => setLocation(input.target.value)}
              defaultValue={location}
            />
            <Button onClick={() => handleSearch()}>Search for weather</Button>
          </form>
        </Box>
        <Box sx={{ mb: 4, p: 20 }}>
          <Heading>{weather?.name}</Heading>
          <ul>
            <li>{getCardinalDirection(weather?.wind?.deg)}: wind dir</li>
            <li>{weather?.wind?.speed} m/s: speed</li>
            <li>{weather?.weather[0].description}: description</li>
            <li>{weather?.sys?.sunrise}: sunrise</li>
            <li>{weather?.sys?.sunset}: sunset</li>
            <li>{weather?.main?.feels_like}° : feels_like</li>
            <li>{weather?.main?.humidity}% : humidity</li>
            <li>{weather?.main?.pressure}% : pressure</li>
            <li>{weather?.main?.temp}° : temp</li>
            <li>{weather?.main?.temp_max}° : temp_max</li>
            <li>{weather?.main?.temp_min}° : temp_min</li>
          </ul>
        </Box>
      </Grid>
    </ThemeProvider>
  )
}

export async function getServerSideProps(context: any) {
  let weatherData = null
  const cityName = context.query.city ? context.query.city : null

  if (cityName) {
    const res = await fetch(
      `${WEATHER_API_URL}?q=${cityName}&appid=${API_KEY}&units=metric&lang=da`,
    )
    weatherData = await res.json()
  }

  return {
    props: {
      city: cityName,
      ...(weatherData && { weather: weatherData }),
    },
  }
}

export default Home
