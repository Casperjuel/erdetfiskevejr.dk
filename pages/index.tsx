import { Heading, ThemeProvider } from "theme-ui";
import { Box, Label, Input, Button } from "theme-ui";

import type { Theme } from "theme-ui";
import { useState } from "react";
import { NextRouter, useRouter } from "next/router";
import { ParsedUrlQueryInput } from "querystring";
import { NextPage } from "next";

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

interface Props {
  city?: string;
  weather?: Record<string, string>;
}

const Home: NextPage<Props> = ({ city, weather }) => {
  const [location, setLocation] = useState(city);
  const router = useRouter();

  const handleSearch = () => {
    updateQueryParam(router, { city: location });
  };

  return (
    <ThemeProvider theme={theme}>
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
  const cityName = context.query.city ? context.query.city : null;
  console.log(context.query);
  
  if (context.query) {
    const res = await fetch(
      `http://vejr.eu/api.php?location=${context.query.city}&degree=C"`
    );
    weatherData = await res.json();
  }

  return {
    props: { city: cityName, weatherData }, // will be passed to the page component as props
  };
}

export default Home;
