---
title: Templating with Jekyll
subtitle: Techniques with Liquid
---
# Complex Menu design

When designing this website, the need for a statically generated menu-bar arose. This menu bar would need to:

 * List all pages
  * without maintaining a separate list of individual items.
  * while being able to order items.
 * Highlight the current page
 * If the current page is part of either "projects" or "blog", highlight the appropriate header.
 * Toggle showing a link to the frontmatter.

The last is easily achieved using `unless` tags:

{% highlight html %}
{% raw %}
{% unless include.hidehome %}
	<li><a href="/">Home</a></li>
{% endunless %}
{% endraw %}
{% endhighlight %}

As is the first: 
{% highlight html %}
{% raw %}
{% assign sorted_pages = site.pages | sort:"innavbar-order" %}
{% for navpage in sorted_pages %}
	{% if navpage.innavbar %}
			<li><a href="{{ navpage.url }}">{{ navpage.title }}</a></li>
	{% endif %}
{% endfor %}
{% endraw %}
{% endhighlight %}

Note the use of the custom page attributes `innavbar` and `innavbar-order`. The defaults are set in `_config.yml` as:
{% highlight yaml %}
defaults:
  -
    scope:
      path: "" # an empty string here means all files in the project
    values:
      innavbar: false
      innavbar-order: 100
{% endhighlight %}

In pages that need to appear in the navigation bar, adding `innavbar: true` to the frontmatter is sufficient. If the order of pages needs to be changed, setting the value of `innavbar-order` allows for arbitrary rearrangement. The higher the value, the later in the generated list the item appears.

Highlighting the current page requires only testing each nav bar element for equality with the current page. This can be done by changing the line inside the loop:
{% highlight html %}
{% raw %}
<li {% if (navpage.path == page.path) %} class="navbar-current" {%endif%} ><a href="{{ navpage.url }}">{{ navpage.title }}</a></li>
{% endraw %}
{% endhighlight %}
Since the `==` operator doesn't check for object equality, we use the unique `.path` field (which is a string) to see if each item in the navigation bar matches the current page.

We meet the third requirement in a similar manner; this time by testing to see if the current page and the nav bar element are in the same category. We set default values for the category in `_config.yml`, and extend the condition with:

```
or (navpage.postcategory and (page.categories contains navpage.postcategory))
```
`.postcategory` is set in the frontmatter of the blog and project list page. If it appears in `page.categories`, the title is highlighted. The initial test is to skip the page if `.postcategory` is not set.

Putting it all together, we have:

{% highlight html %}
{% raw %}
{% unless include.hidehome %}
	<li><a href="/">Home</a></li>
{% endunless %}
{% assign sorted_pages = site.pages | sort:"innavbar-order" %}
{% for navpage in sorted_pages %}
	{% if navpage.innavbar %}
			<li {% if (navpage.path == page.path) or (navpage.postcategory and (page.categories contains navpage.postcategory)) %} class="navbar-current" {%endif%} ><a href="{{ navpage.url }}">{{ navpage.title }}</a></li>
	{% endif %}
{% endfor %}
{% endraw %}
{% endhighlight %}

# Images in Blog Posts

Jekyll has no standard way to add images to blog posts. Current solutions include:

 * Putting all images in a single folder.
 * Putting all images in a single folder, prefixed with the post name.
 * Grouping all images in folders by post and linking manually.

A good solution for this problem would:

 * Allow users to group images by post.
 * Allow users to keep their images and posts together.
 * Produce image URLs automatically.

A great solution would also generate thumbnails and compress images automatically.

This last option is possible only because this website uses a build system takes images from directories near the source files, converts them, and places them in folders in predetermined locations. Instead of the usual markdown syntax `[Caption of Image](/path/to/image.png)`, use `{% raw %}{% include blogimage src="/path/to/image.png" caption="Caption of Image" %}{% endraw %}`. [This file](https://github.com/gauravmm/gauravmanek.com/blob/master/_content/_includes/blogimage), in the includes folder, contains the rest of the code.

# YouTube

A one-line include file handles this:

{% highlight html %}
{% raw %}
<iframe class="youtube" width="560" height="420" src="//www.youtube.com/embed/{{include.id}}"></iframe>
{% endraw %}
{% endhighlight %}

Use it as `{% raw %}{% include youtube id="D7Ses-VGU9U" %}{% endraw %}`.
