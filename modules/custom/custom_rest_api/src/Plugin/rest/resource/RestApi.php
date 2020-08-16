<?php

namespace Drupal\custom_rest_api\Plugin\rest\resource;

use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\taxonomy\Entity\Term;
use Drupal\file\Entity\File;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "custom_post_api",
 *   label = @Translation("Custom rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/custom",
 *     "https://www.drupal.org/link-relations/create" = "/api/custom"
 *   }
 * )
 */
class RestApi extends ResourceBase {
  /**
   * Responds to POST requests.
   * @param $data
   */
  public function post(array $data) {

    $image_data = base64_decode($data['file']['image']);
    if ($image_data) {
     // Picture folder to store image using image field settings.
     $file_info = file_save_data($image_data, 'public://' . $data['file']['filename'], FILE_EXISTS_REPLACE);
    }

    // Loading taxonomy term of vocabulary category.
    $query_cat = \Drupal::entityQuery('taxonomy_term')->condition('vid', 'category');
    $result_cat = $query_cat->execute();
      foreach ($result_cat as $key => $value) {
        $result_cat[$key] = Term::load($value)->getName();
    }

    // Create Category taxonomy.
    foreach($data['category']['value'] as $item) {
      $terms = [
      'parent' => [],
      'name' => $item,
      'vid' => 'category',
      ];

      $search_cat = array_search($terms['name'], $result_cat);
      if($search_cat) {
        $cat_id [] = $search_cat;
      }
      else {
        $cat_term = Term::create($terms);
        $cat_term->save();
        $cat_id []= $cat_term->id();
      }
    }

    // Loading taxonomy term of vocabulary tags.
    $query_tag = \Drupal::entityQuery('taxonomy_term')->condition('vid', 'tags');
    $result_tag = $query_tag->execute();
      foreach ($result_tag as $key => $value) {
        $result_tag[$key] = Term::load($value)->getName();
    }

    // Create Meta Tag taxonomy.
    foreach($data['meta_tag']['value'] as $item) {
      $terms = [
      'parent' => [],
      'name' => $item,
      'vid' => 'tags',
    ];

    $search_tag = array_search($terms['name'], $result_tag);
    if($search_tag) {
      $tag_id [] = $search_tag;
    }
    else {
      $tag_term = Term::create($terms);
      $tag_term->save();
      $tag_id[] = $tag_term->id();
    }
    }

    // Node Create with new field Values.
    $node = Node::create(
      [
        'type' => $data['type']['value'],
        'title' => $data['title']['value'],
        'body' => [
          'summary' => '',
          'value' => $data['body']['value'],
          'format' => 'full_html',
        ],
        'field_json_image' => [
          'target_id' => $file_info->id(),
          'alt' => 'No Image',
          'title' => 'Sample Image File'
        ],
        'field_category' => $cat_id,
        'field_tags' => $tag_id,
      ]
    );

    $node->save();

    // Desired Url Alias to set.
    $url_alias = '/mypath/';
    $path = \Drupal::service('path.alias_storage')->save('/node/'.$node->id(), $url_alias, "en");

    return new ResourceResponse($node);
  }
}
