import { Injectable } from '@nestjs/common';
import { Flight } from '@prisma/client';
import { Route } from 'api/types/route.type';

interface FindRouteOptions {
  originCity: string;
  destinationCity: string;
  departureTime: Date;
  passengerAmount: number;
}

interface FindRouteDfs {
  currentCity: string;
  route: Flight[];
  previousFlightArrivalTime: number;
  visitedCities: Set<string>;
  routes: Route[];
}

interface FindFlightConditions {
  destinationCity: string;
  passengerAmount: number;
}

@Injectable()
export class FlightGraphService {
  vertices: Map<Flight, Flight[]>;

  constructor() {
    this.vertices = new Map<Flight, Flight[]>();
  }

  buildGraph(flights: Flight[]) {
    const vertices = this.vertices;

    this.addVertices(flights);

    vertices.forEach((value, vertex) => {
      const appropriateFlights = flights.filter(
        (flight) => flight.originCity === vertex.destinationCity,
      );
      this.addEdges(vertex, appropriateFlights);
    });
  }

  addVertices(vertices: Flight[]) {
    vertices.forEach((vertex) => this.addVertex(vertex));
  }

  addVertex(vertex: Flight) {
    if (!this.vertices.get(vertex)) {
      this.vertices.set(vertex, []);
    }
  }

  addEdges(vertex1: Flight, vertices: Flight[]) {
    vertices.forEach((vertex) => this.addEdge(vertex1, vertex));
  }

  addEdge(vertex1: Flight, vertex2: Flight) {
    this.vertices.get(vertex1).push(vertex2);
  }

  async findRoutes(options: FindRouteOptions): Promise<Route[]> {
    return new Promise((resolve) => {
      const { originCity, destinationCity, departureTime, passengerAmount } =
        options;
      const routes: Route[] = [];
      const visitedCities = new Set<string>();
      const flightVertices = Array.from<Flight>(this.vertices.keys());

      const flightsFromOriginCity = flightVertices.filter((flight) => {
        const areOriginCitiesEqual = flight.originCity === originCity;
        const areDepartureDatesEqual =
          flight.departureTime.toLocaleDateString() ===
          departureTime.toLocaleDateString();
        const isThereNecessarySeatAmount =
          flight.availableSeatAmount >= passengerAmount;

        if (
          areOriginCitiesEqual &&
          areDepartureDatesEqual &&
          isThereNecessarySeatAmount
        ) {
          return flight;
        }
      });

      for (const flight of flightsFromOriginCity) {
        const data: FindRouteDfs = {
          currentCity: flight.destinationCity,
          route: [flight],
          previousFlightArrivalTime: flight.arrivalTime.getTime(),
          visitedCities,
          routes,
        };

        const flightConditions = { destinationCity, passengerAmount };
        this.dfs(data, flightConditions);
      }

      return resolve(routes);
    });
  }

  private dfs(data: FindRouteDfs, flightConditions: FindFlightConditions) {
    const {
      currentCity,
      route,
      previousFlightArrivalTime,
      visitedCities,
      routes,
    } = data;

    visitedCities.add(currentCity);

    if (currentCity === flightConditions.destinationCity) {
      routes.push(route.slice());
      visitedCities.delete(currentCity);
      return;
    }

    const flightsFromCurrentCity = Array.from<Flight>(
      this.vertices.keys(),
    ).filter(
      (flight) =>
        flight.originCity === currentCity &&
        flight.availableSeatAmount >= flightConditions.passengerAmount,
    );

    for (const flight of flightsFromCurrentCity) {
      if (
        !visitedCities.has(flight.destinationCity) &&
        flight.departureTime.getTime() >= previousFlightArrivalTime
      ) {
        const newRoute = route.slice();
        newRoute.push(flight);

        const data: FindRouteDfs = {
          visitedCities,
          routes,
          route: newRoute,
          currentCity: flight.destinationCity,
          previousFlightArrivalTime: flight.arrivalTime.getTime(),
        };
        this.dfs(data, flightConditions);
      }
    }

    visitedCities.delete(currentCity);
  }
}
