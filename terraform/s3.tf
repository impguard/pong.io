# --------------------------------------------------
# Client Builds Storage
# --------------------------------------------------

resource "aws_s3_bucket" "pong_client_builds" {
  bucket = "pong-client-builds"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# --------------------------------------------------
# Client Website
# --------------------------------------------------

module "pong_client_site_dev" {
  source = "./client_website"

  s3 = {
    bucket_name = "${var.project_id}-dev-site"
  }
}

module "pong_client_site_test" {
  source = "./client_website"

  s3 = {
    bucket_name = "${var.project_id}-test-site"
  }
}

module "pong_client_site_prod" {
  source = "./client_website"

  s3 = {
    bucket_name = "${var.project_id}-prod-site"
  }
}
