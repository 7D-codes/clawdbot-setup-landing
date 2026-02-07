terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

variable "hcloud_token" {
  description = "Hetzner Cloud API Token"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH Public Key for server access"
  type        = string
}

provider "hcloud" {
  token = var.hcloud_token
}

# SSH Key
resource "hcloud_ssh_key" "clawdeploy" {
  name       = "clawdeploy-key"
  public_key = var.ssh_public_key
}

# Firewall
resource "hcloud_firewall" "clawdeploy" {
  name = "clawdeploy-firewall"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "8080"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

# VPS Pool - Start with 2 servers (can scale up)
resource "hcloud_server" "clawdeploy_node" {
  count       = 2
  name        = "clawdeploy-node-${count.index + 1}"
  server_type = "cpx31"  # 4 vCPU, 8GB RAM, €12.60/mo
  image       = "ubuntu-22.04"
  location    = "nbg1"   # Nuremberg (good latency)
  ssh_keys    = [hcloud_ssh_key.clawdeploy.id]
  firewall_ids = [hcloud_firewall.clawdeploy.id]

  labels = {
    environment = "production"
    purpose     = "clawdeploy-pool"
  }

  user_data = file("${path.module}/cloud-init.yaml")
}

# Output
output "server_ips" {
  value = hcloud_server.clawdeploy_node[*].ipv4_address
}

output "server_ids" {
  value = hcloud_server.clawdeploy_node[*].id
}
