<?php

namespace Drupal\combined_events\Service;

use GuzzleHttp\ClientInterface;

/**
 * Service that fetches external event data.
 */
class EventsFetcher {

  /**
   * The HTTP client.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected $httpClient;

  /**
   * Constructs a new EventsFetcher.
   *
   * @param \GuzzleHttp\ClientInterface $http_client
   *   The HTTP client service.
   */
  public function __construct(ClientInterface $http_client) {
    $this->httpClient = $http_client;
  }

  /**
   * Fetches events from an external API.
   *
   * @return array
   *   A list of events.
   */
  public function fetchEvents() {
    try {
      $response = $this->httpClient->request('GET', 'https://eksponent.com/sites/default/files/sample-api/events.json', [
        'headers' => [
          'Accept' => 'application/json',
        ],
      ]);
      $data = json_decode($response->getBody(), TRUE);
      // \Drupal::logger('eksponent_events')->info('External events fetched.');

      return $data;
    }
    catch (\Exception $e) {
      // Log an error if the request failed.
      \Drupal::logger('combined_events')
        ->error('Failed to fetch events: @message', [
          '@message' => $e->getMessage(),
        ]);
      return [];
    }
  }

}
