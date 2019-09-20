import gql from "graphql-tag";
import { print } from "graphql";
import * as GraphQLSimpleFetch from "../src/index";

const query1 = gql`
  {
    queryArtists(byName: "Red Hot Chili Peppers") {
      name
      id
      image
    }
  }
`;
GraphQLSimpleFetch.rawRequest(
  //   "https://spotify-graphql-server.herokuapp.com/graphql",
  "http://localhost:10000/post",
  {},
  print(query1),
  {
    file1: new File(["olle"], "olle.txt")
  }
).then(data => {
  console.log(data);
});

const query2 = gql`
  {
    queryArtists(byName: "Red Hot Chili Peppers") {
      name
      id
      image
    }
  }
`;

GraphQLSimpleFetch.rawRequest(
  "https://spotify-graphql-server.herokuapp.com/graphql",
  {},
  print(query2),
  {}
).then(data => {
  console.log(data);
});
GraphQLSimpleFetch.request(
  "https://spotify-graphql-server.herokuapp.com/graphql",
  {},
  print(query2),
  {}
).then(data => {
  console.log(data);
});
