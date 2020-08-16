<?php

namespace Drupal\custom_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\taxonomy\Entity\Term;

class GetController extends ControllerBase {
  /**
   * If API key matched & node exist then getting and showing the node data.
   *
   * @param string $apikey
   *   The 16 digit API key
   * @param int $node_id
   *   The node ID
   */
  public function GetResource($apikey, $node_id) {

    $config = $this->config('custom_rest_api.settings');
    if ($config->get('api_key') !== $apikey) {
      // Check if the API key is matched with the config form api.
      $response['message'] = 'Please provide the correct API key.';
      return new JsonResponse($response);
    }
    else {
      $node = \Drupal::entityManager()->getStorage('node')->load($node_id);
      // Return if the node does not exists in the system.
      if (empty($node)) {
        $response['message'] = 'The node does not exist.';
        return new JsonResponse($response);
      }

      if($node->getType() == 'json_data') {
        if(!empty($node->field_json_image->entity)) {
          // Fetching Image URL.
          $image = file_create_url($node->field_json_image->entity->getFileUri());
        }

        if(!empty($node->field_category->entity)){
          // Fetching category field value.
          foreach ($node->field_category as $value) {
            $cat[$value->target_id] = Term::load($value->target_id)->getName();
          }
        }

        if(!empty($node->field_tags->entity)){
          // Fetching meta tag field value.
          foreach ($node->field_tags as $value) {
            $tag[$value->target_id] = Term::load($value->target_id)->getName();
          }
        }

        $node_array = [
          'title' => $node->title->value,
          'body' => $node->body->value,
          'image' => ['url' => $image],
          'category' => $cat,
          'meta_tag' => $tag
        ];
      }

      else {
        $node_array = [
          'title' => $node->title->value,
          'body' => $node->body->value
        ];
      }
    }

    return new JsonResponse($node_array);

  }
}
