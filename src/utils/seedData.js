export const seedInitialData = async (userId) => {
    try {
        await Order.deleteMany({ user: userId });
        await Product.deleteMany({ order: { $in: (await Order.find({ user: userId })).map(o => o._id) } });

        // Create sample orders
        const order1 = new Order({
            title: 'Order 1',
            description: 'First order description',
            date: new Date('2017-06-29 12:09:33'),
            user: userId
        });

        const order2 = new Order({
            title: 'Order 2',
            description: 'Second order description',
            date: new Date('2018-07-15 14:30:00'),
            user: userId
        });

        const order3 = new Order({
            title: 'Order 3',
            description: 'Third order description',
            date: new Date('2019-08-20 09:15:00'),
            user: userId
        });

        const savedOrder1 = await order1.save();
        const savedOrder2 = await order2.save();
        const savedOrder3 = await order3.save();

        // Create sample products
        const products = [
            {
                serialNumber: 1234,
                isNew: true,
                photo: 'pathToFile.jpg',
                title: 'Product 1',
                type: 'Monitors',
                specification: 'Specification 1',
                guarantee: {
                    start: new Date('2017-06-29 12:09:33'),
                    end: new Date('2020-06-29 12:09:33')
                },
                price: [
                    { value: 100, symbol: 'USD', isDefault: false },
                    { value: 2600, symbol: 'UAH', isDefault: true }
                ],
                order: savedOrder1._id,
                date: new Date('2017-06-29 12:09:33')
            },
            {
                serialNumber: 5678,
                isNew: false,
                photo: 'pathToFile2.jpg',
                title: 'Product 2',
                type: 'Phones',
                specification: 'Specification 2',
                guarantee: {
                    start: new Date('2018-07-15 14:30:00'),
                    end: new Date('2021-07-15 14:30:00')
                },
                price: [
                    { value: 500, symbol: 'USD', isDefault: false },
                    { value: 13500, symbol: 'UAH', isDefault: true }
                ],
                order: savedOrder2._id,
                date: new Date('2018-07-15 14:30:00')
            },
            {
                serialNumber: 9012,
                isNew: true,
                photo: 'pathToFile3.jpg',
                title: 'Product 3',
                type: 'Tablets',
                specification: 'Specification 3',
                guarantee: {
                    start: new Date('2019-08-20 09:15:00'),
                    end: new Date('2022-08-20 09:15:00')
                },
                price: [
                    { value: 300, symbol: 'USD', isDefault: false },
                    { value: 8100, symbol: 'UAH', isDefault: true }
                ],
                order: savedOrder3._id,
                date: new Date('2019-08-20 09:15:00')
            },
            {
                serialNumber: 3456,
                isNew: true,
                photo: 'pathToFile4.jpg',
                title: 'Product 4',
                type: 'Monitors',
                specification: 'Specification 4',
                guarantee: {
                    start: new Date('2020-01-10 10:00:00'),
                    end: new Date('2023-01-10 10:00:00')
                },
                price: [
                    { value: 200, symbol: 'USD', isDefault: false },
                    { value: 5400, symbol: 'UAH', isDefault: true }
                ],
                order: savedOrder1._id,
                date: new Date('2020-01-10 10:00:00')
            }
        ];

        await Product.insertMany(products);
        console.log('Sample data seeded successfully for user:', userId);
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};