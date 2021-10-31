import { Card, Grid, Heading, ThemeProvider } from 'theme-ui'
import { Box, Label, Input, Button } from 'theme-ui'

import type { Theme } from 'theme-ui'
import { useEffect, useState } from 'react'
import { NextRouter, useRouter } from 'next/router'
import { ParsedUrlQueryInput } from 'querystring'
import { NextPage } from 'next'
import parseISO from 'date-fns/parseISO'
import format from 'date-fns/format'
import proj4 from 'proj4'

const API_KEY = '05103498-1cfa-4c76-acc4-d57f352b2a50'
const TODAY = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

const GOOGLE_API_KEY = 'AIzaSyANqxJpumatJ5Eg4laeemVtRGDI832pIMk'
const GOOGLE_API_URL =
  'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
const WEATHER_API_URL =
  'https://dmigw.govcloud.dk/v2/metObs/collections/observation/items'
const OCEAN_API_URL =
  'https://dmigw.govcloud.dk/v2/oceanObs/collections/observation/items'
const STATION_API_URL =
  'https://dmigw.govcloud.dk/v2/metObs/collections/station/items'

const getCoordinates = async (query) => {
  const res = await fetch(
    `${GOOGLE_API_URL}?input=${query}&fields=formatted_address,geometry&inputtype=textquery&key=${GOOGLE_API_KEY}`,
  )
  const data = await res.json()
  console.log(data)

  return data
}

const getStations = async () => {
  const res = await fetch(
    `${STATION_API_URL}?status=Active&type=Synop&api-key=${API_KEY}&limit=100000`,
  )
  const data = await res.json()

  return data.features
}

const findStationID = async (stations: any[], cityName: string) => {
  if (stations) {
    const result = stations.find((item: { properties: { name: string } }) =>
      item.properties.name.includes(cityName),
    )

    return result
      ? {
          stationName: result.properties.name,
          stationId: result.properties.stationId,
        }
      : null
  }
  return null
}

const getWeatherData = async (
  stationID: string,
  period:
    | 'latest'
    | 'latest-hour'
    | 'latest-day'
    | 'latest-week'
    | 'latest-month' = 'latest-week',
) => {
  if (stationID) {
    const res = await fetch(
      `${WEATHER_API_URL}?datetime=${TODAY}&sortorder=observed,DESC&stationId=${stationID}&api-key=${API_KEY}&limit=100000`,
    )
    const data = await res.json()
    return data.features
  } else {
    return null
  }
}

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

const getMetricSuffix = (parameterId: string) => {
  if (parameterId === 'temp_dry') {
    return '°'
  } else if (parameterId === 'humidity') {
    return '%'
  } else if (parameterId === 'wind_speed') {
    return ' m/s'
  } else if (parameterId === 'wind_dir') {
    return '°'
  } else if (parameterId === 'wind_max') {
    return ' m/s'
  }
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
const getColorFromTemp = (temp: string) => {
  if (parseFloat(temp) < 1) {
    return '#72cdfe'
  } else if (parseFloat(temp) > 30) {
    return '#ff9c04'
  } else if (parseFloat(temp) > 20) {
    return '#fefd74'
  } else if (parseFloat(temp) > 15) {
    return '#d3ffca'
  } else if (parseFloat(temp) > 10) {
    return '#a0fcff'
  } else if (parseFloat(temp) > 5) {
    return '#87e7fe'
  }
}

interface Props {
  city: string
  weather?: Record<string, any>
}
const allowedParams = [
  'temp_dry',
  'humidity',
  'wind_dir',
  'wind_speed',
  'wind_max',
]

const filterParams = (data: any[]) => {
  const filtered = data?.filter(
    (item: { properties: { parameterId: string } }) =>
      allowedParams.includes(item.properties.parameterId),
  )

  return filtered
}

const Home: NextPage<Props> = ({ city, weather }) => {
  const [location, setLocation] = useState(city)
  const [locationName, setLocationName] = useState('')
  const [data, setData] = useState([])
  const router = useRouter()

  const handleSearch = () => {
    updateQueryParam(router, { city: location })
  }

  useEffect(() => {
    getCoordinates(city)
    getStations().then((return_of_one) => {
      findStationID(return_of_one, city).then((return_of_two) => {
        setLocationName(return_of_two?.stationName)
        getWeatherData(return_of_two?.stationId, 'latest-hour').then(
          (return_of_three) => {
            return setData(filterParams(return_of_three))
          },
        )
      })
    })
  }, [city])

  console.log(data)

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
          <Heading>{locationName}</Heading>
          {data?.map(
            (metric): JSX.Element => (
              <li key={metric.properties.parameterId}>
                <Heading as="h4">{metric.properties.parameterId}</Heading>
                <Label>
                  {metric.properties.parameterId === 'wind_dir' ? (
                    getCardinalDirection(metric.properties.value)
                  ) : (
                    <>{metric.properties.value}</>
                  )}
                  {getMetricSuffix(metric.properties.parameterId)}
                </Label>
              </li>
            ),
          )}
        </Box>
        <Box sx={{ mb: 4, p: 20 }}>
          {weather && (
            <Card
              sx={{
                maxWidth: 256,
                backgroundColor: getColorFromTemp(
                  weather.CurrentData?.temperature,
                ),
              }}
            >
              <Heading>{weather.LocationName}</Heading>
              <ul>
                <li>{weather.CurrentData?.temperature}°</li>
                <li>{weather.CurrentData?.skyText}</li>
                <li>{weather.CurrentData?.humidity}%</li>
                <li>{weather.CurrentData?.windText}</li>
              </ul>
            </Card>
          )}
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
      `http://vejr.eu/api.php?location=${cityName}&degree=C`,
    )
    weatherData = await res.json()
  }

  console.log(weatherData)

  return {
    props: { city: cityName, ...(weatherData && { weather: weatherData }) }, // will be passed to the page component as props
  }
}

export default Home
