<?php
namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class Agent{
    public $user = 'csie';
    protected Client $http;
    protected $baseUrl = 'http://127.0.0.1:10001';

    public function __construct(?Client $client = null)
    {
        $this->http = $client ?? new Client([
            'timeout' => 10,
        ]);
    }

    public function createSession(string $name, string $id): bool
    {
        $url = "$this->baseUrl/apps/$name/users/$this->user/sessions/$id";
        try {
            $response = $this->http->post($url, [
                'json' => ['additionalProp1' => (object)[]],
            ]);
            $status = $response->getStatusCode();
            return $status == 200;
        } catch (RequestException $e) {
            if ($e->hasResponse()) {
                return false;
            }
            throw $e;
        }
    }

    public function run(string $name, string $id, string $input){
        $url = "$this->baseUrl/run";
        // Build the request body according to the provided schema
        $payload = [
            'appName' => $name,
            'userId' => $this->user,
            'sessionId' => $id,
            'newMessage' => [
                'parts' => [
                    [
                        // put the provided input text into the first part
                        'text' => $input,
                    ],
                ],
                // role belongs to the newMessage object
                'role' => 'user',
            ],
            'streaming' => false,
            // represent an empty object for stateDelta
            'stateDelta' => (object)[],
        ];

        try {
            $response = $this->http->post($url, [
                'json' => $payload,
            ]);

            $status = $response->getStatusCode();
            $body = (string) $response->getBody();
            $decoded = json_decode($body, true);

            // If the response body is not JSON, return raw body as string
            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'success' => $status === 200,
                    'status' => $status,
                    'body' => $body,
                ];
            }

            return $decoded;
        } catch (RequestException $e) {
            if ($e->hasResponse()) {
                $res = $e->getResponse();
                $status = $res->getStatusCode();
                $body = (string) $res->getBody();
                $decoded = json_decode($body, true);
                return [
                    'success' => false,
                    'status' => $status,
                    'body' => json_last_error() === JSON_ERROR_NONE ? $decoded : $body,
                ];
            }

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function agent_translate(){

    }
    public function agent_spider(){

    }
}
