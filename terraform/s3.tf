# --------------------------------------------------
# Client Builds Storage
# --------------------------------------------------

module "pong_client_builds_dev" {
  source = "./client_builds"

  s3 = {
    project_id = "${var.project_id}"
    build_type = "dev"
  }
}

module "pong_client_builds_prod" {
  source = "./client_builds"

  s3 = {
    project_id = "${var.project_id}"
    build_type = "prod"
  }
}

# --------------------------------------------------
# Client Website
# --------------------------------------------------

module "pong_client_site_dev" {
  source = "./client_website"

  s3 = {
    project_id = "${var.project_id}"
    bucket_name = "dev.paddleroyale.io"
    environment = "dev"
  }
}
module "pong_client_site_test" {
  source = "./client_website"

  s3 = {
    project_id = "${var.project_id}"
    bucket_name = "test.paddleroyale.io"
    environment = "test"
  }
}
module "pong_client_site_prod" {
  source = "./client_website"

  s3 = {
    project_id = "${var.project_id}"
    bucket_name = "paddleroyale.io"
    environment = "prod"
  }
}
