import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Heading, ThemeProvider } from "theme-ui";
import { Box, Label, Input, Button } from "theme-ui";

import type { Theme } from "theme-ui";
import { useEffect, useState } from "react";
import Router, { NextRouter, useRouter } from "next/router";
import { ParsedUrlQueryInput } from "querystring";
import { debounce } from "./src/utils";

export function updateQueryParam(
  router: NextRouter,
  query: ParsedUrlQueryInput
): void {
  router.push(
    {
      pathname: window.location.pathname,
      query: query,
    },
    undefined
  );
}

export const theme: Theme = {
  fonts: {
    body: "system-ui, sans-serif",
    heading: '"Avenir Next", sans-serif',
    monospace: "Menlo, monospace",
  },
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#33e",
  },
};

interface Ilocation {
  accuracy: string;
  altitude: string;
  altitudeAccuracy: string;
  heading: string;
  latitude: string;
  longitude: string;
  speed: string;
}

const apiFetcher = async (
  latitude: string,
  longitude: string
): Promise<any> => {
  return await fetch(
    `https://api.dataforsyningen.dk/adgangsadresser/reverse?x=${latitude}&y=${longitude}&struktur=mini`
  ).then((response) => response.json());
};

const findCityName = (latitude: string, longitude: string) => {
  let result;
  apiFetcher(latitude, longitude).then((res) => (result = res.body));

  return result;
};

const Home: NextPage = ({ city, weather }) => {
  const [location, setLocation] = useState(city);
  const router = useRouter();

  const positionCallback = (data) => {
    console.log(data);

    const { latitude, longitude } = data;

    console.log(findCityName(latitude, longitude));
  };
  console.log(location);

  const handleSearch = () => {
    updateQueryParam(router, { search: location });
  };

  const getPosition = () => {
    console.log("called");

    return navigator.geolocation.getCurrentPosition((e) => positionCallback(e));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mb: 4, p: 20 }}>
        <form onSubmit={(e) => console.log(e) && handleSearch()}>
          <Label sx={{ mb: 2 }} htmlFor="search">
            Indtast by
          </Label>
          <Input
            sx={{ mb: 3 }}
            id="search"
            name="search"
            onChange={(input) => setLocation(input.target.value)}
            defaultValue={location}
          />
          <Button onClick={() => handleSearch()}>Search for weather</Button>
        </form>
        {!city && <Button onClick={() => getPosition()}> Find location</Button>}
        {weather && (
          <>
            <Heading>{weather.LocationName}</Heading>
            <ul>
              <li>{weather.CurrentData.temperature}°</li>
              <li>{weather.CurrentData.skyText}</li>
              <li>{weather.CurrentData.humidity}%</li>
              <li>{weather.CurrentData.windText}</li>
            </ul>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export async function getServerSideProps(context: any) {
  let weatherData = null;
  if (context.query?.search) {
    const res = await fetch(
      `http://vejr.eu/api.php?location=${context.query.search}&degree=C"`
    );
    weatherData = await res.json();
  }

  return {
    props: {weather: weatherData }, // will be passed to the page component as props
  };
}

export default Home;
