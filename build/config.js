var options = {
    site: 'My Blogs',
    url: '/v1/',
    auth: false,
    rest: {
        url: '/v1/',
        filter: 'flat',
        page: {
            start: '_start',
            end: '_end',
            limit: '_limit',
            page: false,
        },
        sort: {
            field: '_sort',
            order: '_order',
            plus: false
        }
    },
    entities: {
        post: {
            entity: 'post',
            model: {
                id: { type: 'integer' },
                title: { type: 'string', required: true },
                author: 'string',
                url: 'string',
                comments: { type: '' },
                tags: { type: '' },
                images: { type: '' },
                category: 'string',
                subCategory: 'string',
                updatedAt: 'string',
                _id: 'string'
            },
            id: 'id',
            fields: {
                title: {
                    type: 'string',
                    detailRoute: 'show'
                },
                comments: {
                    type: 'referenced_list',
                    targetEntity: 'comment',
                    targetReferenceField: 'postId',
                    targetFields: ['id','body'],
                    sort: {
                        field: 'id',
                        dir: 'DESC'
                    }
                },
                tags: {
                    field: 'tags',
                    type: 'reference_many',
                    label: 'Tags',
                    targetEntity: 'tag',
                    targetField: 'name',
                    sort: {
                        field: 'name',
                        dir: 'ASC'
                    }
                },
                url: {
                    field: 'url',
                    type: 'string',
                    format: 'url',
                    caption: 'Go'
                },
                images: {
                    type: 'referenced_list',
                    targetEntity: 'image',
                    targetReferenceField: 'postId',
                    targetFields: ['id','caption','name'],
                    sort: {
                        field: 'id',
                        dir: 'DESC'
                    },
                    readOnly: true
                },
                updatedAt: {
                    readOnly: true
                },
                // _id: {
                //     type: 'prepare',
                //     targetField: 'id'
                // },
                category: {
                    type: 'choice',
                    choices: [
                        { label: 'Toy', value: 'toy' },
                        { label: 'Car', value: 'car' },
                    ]
                },
                subCategory: {
                    label: 'Sub',
                    type: 'choice',
                    choices: [
                        { category: 'toy', label: 'Toy1', value: 'toy1' },
                        { category: 'toy', label: 'Toy2', value: 'toy2' },
                        { category: 'car', label: 'Car1', value: 'car1' },
                        { category: 'car', label: 'Car2', value: 'car2' },
                    ],
                    choiceField: 'category',
                }
            },
            default: {
                fields: [ 'id', 'title', 'author', 'comments', 'tags', 'url', 'images', 'category', 'subCategory' ],
            },
            list: {
                description: 'Blogging',
                fields: [ 'id', 'title', 'author', 'category', 'subCategory', 'tags', 'url'],
                actions: ['edit']
            },
            creation: {
                description: 'Create a blog'
            },
            edition: {
                description: 'Edit blog',
            },
            show: {
                title: 'title',
                description: 'Blog details'
            },
            search: {
                fields: ['id']
            },
        },
        comment: {
            entity: 'comment',
            model: {
                id: { type: 'integer' },
                postId: { type: 'integer', ref: 'post' },
                body: { type: 'string', required: true },
                createdAt: { type: 'date' }
            },
            id: 'id',
            fields: {
                postId: {
                    label: 'Post',
                    field: 'postId',
                    type: 'reference',
                    targetEntity: 'post',
                    targetField: 'title',
                    sort: {
                        field: 'title',
                        dir: 'ASC'
                    },
                    perPage: 200,
                    pinned: true
                },
                createdAt: {
                    label: 'Created',
                    type: 'datetime',
                    formatString: 'yyyy-MM-dd'
                },
                body: {
                    map: function(value, entry) {
                        return entry.postId + '-' + value;
                    }
                }
            },
            default: {
                fields: [ 'id', 'postId', 'body', 'createdAt' ],
            },
            list: {},
            creation: {},
            edition: {},
            show: {
                title: 'body'
            },
            search: {
                fields: ['id', 'postId']
            },
        },
        tag: {
            entity: 'tag',
            model: {
                id: { type: 'integer' },
                name: { type: 'string', required: true },
            },
            id: 'id',
            label: 'Tagging',
            fields: {},
            default: {
                fields: ['id', 'name']
            },
            list: {},
            creation: {},
            edition: {},
            show: {
                title: 'name'
            },
            search: {
                fields: ['id', 'name']
            },
        },
        image: {
            entity: 'image',
            model: {
                id: { type: 'integer' },
                postId: { type: 'integer', ref: 'post' },
                name: { type: 'string', required: true },
                caption: 'string'
            },
            id: 'id',
            fields: {
                postId: {
                    label: 'Post',
                    field: 'postId',
                    type: 'reference',
                    targetEntity: 'post',
                    targetField: 'title',
                    sort: {
                        field: 'title',
                        dir: 'ASC'
                    },
                    perPage: 200,
                    pinned: true
                },
                name: {
                    field: 'name',
                    type: 'string',
                    format: 'image',
                    url: 'https://s3-us-west-1.amazonaws.com/qplot-showcase/',
                    width: 200
                }
            },
            default: {
                fields: ['id', 'postId', 'name', 'caption']
            },
            list: {},
            creation: {},
            edition: {},
            show: {
                title: 'name'
            },
            search: {
                fields: ['id', 'postId', 'name']
            },
        }
    },
    routes: [
        {
            title: 'Blog',
            icon: 'inbox',
            items: ['post', 'comment']
        },
        {
            title: 'Other',
            icon: 'inbox',
            items: ['tag', 'image']
        }
    ]
};
