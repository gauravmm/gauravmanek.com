---
title: Configuring a GPU Cluster
subtitle: Linux Sysadmin 101.
tags: [gpu-cluster]
---

Here are some tips and tricks on configuring a GPU cluster, based on my experience. These are not exhaustive.

# Scriptable Configuration

Use a configuration deployment language, like [Ansible](https://www.ansible.com/), [Chef](https://www.chef.io/), [Puppet](https://puppet.com/), [SaltStack](https://www.saltstack.com/), etc. I recommend Ansible for its shallow learning curve and configuraton power.

There is an initial set-up cost that is worth paying: expect writing the initial configuration to take about two weeks, especially if you test in virtual machines.

This is an immensely valuable step because once the configuration is created, subsequent compute machines can be set up in as little as twenty minutes. As configuration options remain similar between OS versions, you can even use this to easily upgrade and downgrade between major versions of your operating system.

# Security

## Passwords

Don't use them. Take these measures so that passwords are only ever needed for emergency recovery; 

 - when setting up the OS, create a user account for installation and recovery. Each machine should have its own recovery password, which should be written down (with pen and paper) and locked inside the machine chassis. Use this user account for the initial configuration, and then again only in case of emergency recovery.
 - Disable passworded SSH login (both `PasswordAuthentication` and `ChallengeResponseAuthentication`) to prevent people logging in without an SSH key.
 - Disable logging in to the initial setup account.
 - Disallow users from setting account passwords, so they cannot log in with physical access to the system
 - Require users to provide SSH public keys when setting up a new account; with a GitHub username, you can directly get them from `https://github.com/username.keys`.
 - Allow sudoers to run passwordless `sudo` commands by replacing `%sudo ALL=.*` with `%sudo ALL=(ALL) NOPASSWD: ALL`, using `visudo`.
 - Each service account that connects over SSH (such as the backup agent) should generate their own key pairs; you should copy each public key to this machine

## User privilege

Don't give your users `sudo` access. Don't install packages in the global Python namespace. Instead, provide your users with `anaconda`, `pyenv`, `python3-venv` to install/compile local builds of Python; this allows users to maintain their own Python installations and `conda`/`pip` libraries.

## Service Accounts

Some service accounts require special privileges: for example, the backup agent's account only needs to read data and should not be able to write anything on the bastion. We do this by authorizing particular command strings in the `sudoers` file. 

To minimize the attack surface, ensure that the bastion host does not have credentials to connect to the backup server; only the backup server should be able to connect to the bastion. This prevents ransomware attacks!

## Home Directories

The simplest security model offered by NFS is sufficient for most uses, as long as you have relatively few users. If you assign each user the same username, `uid` and `gid` across all machines (trivial to do with Ansible), NFS will correctly apply the default linux access controls.

## Firewalls

Use `ufw` or a similar easy-to-configure firewall. If you configure it with Ansible, you can bundle the firewall rules for each task with the task itself, so you can guarantee that you do not have exposed ports.

During acceptance testing, ensure that outside users cannot access inside-only ports, for example, NFS.

Ensure that you internal network is also firewalled; only allow each compute server to communicate with the bastion. (This needs to be set up in your managed switch.)


# Condition Monitoring

There are a few main types of questions that people ask about your cluster. The purpose of condition monitoring is to quantitatively answer these questions:

 - What machines can I use right now?
 - Why did my job/that machine crash?
 - Do we need to buy more _resource_?

As a rule of thumb, it is better to collect more data than less, and to retain that data for longer than necessary.

I recommend using [Prometheus](https://prometheus.io/) to collect and hold statistics (increase the retention to a year or more!) You can visualize these with [Grafana](https://grafana.com/). (Avoid using the package manager version of Grafana, it is often out of date.)

At minimum, use [this script](https://github.com/gauravmm/prometheus_reporter) to report statistics to Prometheus.

Ensure that you get alerts if machines go down, your backup job fails, or some other exceptions; [Nagios](https://www.nagios.org/) is the industry standard. I prefer a custom Slack bot to handle this. 

## GPU Monitoring

In addition to simple condition statistics, you should explicitly track jobs running on GPUs. A custom-written GPU dashboard graphing the current availability of GPUs is a days' work at most.

{% include blogimage src="gpu_dashboard.png" caption="Simple GPU dashboard" %}

After its introduction in my research group, this feature was among the most popular.

## SysLog

Forward your `syslog` from the compute machines to the bastion to be able to trace failures if a machine fails. You can do this by writing this to `/etc/rsyslog.d/70-network.conf`, permitting port `udp:514` in your firewall, and reloading `rsyslog`:

```liquid
# Rules for rsyslog.

# Log by facility.
auth,authpriv.*                @{{ bastion_hostname }}.local
cron.*                         @{{ bastion_hostname }}.local
kern.*                         @{{ bastion_hostname }}.local
user.*                         @{{ bastion_hostname }}.local
*.emerg                        @{{ bastion_hostname }}.local
```

## Drive Monitoring

Run `smartd` automatically; schedule a short test daily and a long test weekly. Configure an alert for this.

# Backups

These are very easy to get wrong!

 - Regularly use `rsync` or similar to verify your backups.
 - Occasionally test manual file recovery.
 - Design your backup system to fail "noisy"; our alert bot triggers an alert if 36 hours pass without a successful backup notification from the backup system, and the size of every day's backup is reported.

# Bug Tracking

Use a bugtracking system to track system upgrades, open issues, etc. GitHub's built-in tracker is more than sufficient for this, especially with the new (in 2019) Projects board feature.

